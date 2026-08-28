<?php

namespace App\Services\Ai;

use App\Models\AiKnowledgeDocument;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class KnowledgeProjectionSynchronizer
{
    public function __construct(
        private readonly KnowledgeDocumentBuilder $documents,
        private readonly OpenAiEmbeddings $embeddings,
    ) {}

    public function configured(): bool
    {
        return DB::getDriverName() === 'pgsql' && $this->embeddings->configured();
    }

    /**
     * Rebuilds a projection from current public records. Source data remains
     * authoritative and documents removed from that source are deleted here.
     *
     * @return array{total: int, embedded: int, unchanged: int, deleted: int}
     */
    public function sync(bool $force = false): array
    {
        if (! $this->configured()) {
            throw new RuntimeException('La sincronización vectorial requiere PostgreSQL y OpenAI embeddings configurados.');
        }

        $rawProjection = $this->documents->all();

        /** @var Collection<string, array<string, mixed>> $projection */
        $projection = $rawProjection->keyBy('document_key');

        if ($projection->count() !== $rawProjection->count()) {
            throw new RuntimeException('La proyección de conocimiento contiene claves duplicadas.');
        }

        /** @var Collection<string, AiKnowledgeDocument> $existing */
        $existing = AiKnowledgeDocument::query()
            ->select(['id', 'document_key', 'checksum', 'embedding_model', 'embedded_at'])
            ->get()
            ->keyBy('document_key');

        $deleted = $this->deleteStaleDocuments($projection->keys()->all());
        $model = $this->embeddings->model();
        $pending = $projection
            ->filter(function (array $document, string $key) use ($existing, $force, $model): bool {
                $stored = $existing->get($key);

                return $force
                    || $stored === null
                    || $stored->checksum !== $document['checksum']
                    || $stored->embedding_model !== $model
                    || $stored->embedded_at === null;
            })
            ->values();

        $embedded = 0;
        foreach ($pending->chunk($this->batchSize()) as $documents) {
            /** @var list<list<float>> $vectors */
            $vectors = $this->embeddings->embed($documents->pluck('content')->all());

            DB::transaction(function () use ($documents, $model, $vectors, &$embedded): void {
                foreach ($documents->values() as $index => $document) {
                    $this->store($document, $vectors[$index], $model);
                    $embedded++;
                }
            });
        }

        return [
            'total' => $projection->count(),
            'embedded' => $embedded,
            'unchanged' => $projection->count() - $pending->count(),
            'deleted' => $deleted,
        ];
    }

    /**
     * @param  list<string>  $keys
     */
    private function deleteStaleDocuments(array $keys): int
    {
        if ($keys === []) {
            return AiKnowledgeDocument::query()->delete();
        }

        return AiKnowledgeDocument::query()->whereNotIn('document_key', $keys)->delete();
    }

    /**
     * @param  array<string, mixed>  $document
     * @param  list<float>  $embedding
     */
    private function store(array $document, array $embedding, string $model): void
    {
        /** @var AiKnowledgeDocument $stored */
        $stored = AiKnowledgeDocument::query()->updateOrCreate(
            ['document_key' => $document['document_key']],
            [
                'source_type' => $document['source_type'],
                'source_id' => $document['source_id'],
                'section' => $document['section'],
                'language' => $document['language'],
                'content' => $document['content'],
                'checksum' => $document['checksum'],
                'metadata' => $document['metadata'],
            ],
        );

        $literal = '['.implode(',', array_map(fn (float $value): string => sprintf('%.8F', $value), $embedding)).']';

        DB::update(
            'UPDATE documentos_conocimiento_ia SET embedding = CAST(? AS halfvec), embedding_model = ?, embedded_at = ?, updated_at = ? WHERE id = ? AND checksum = ?',
            [$literal, $model, now(), now(), $stored->id, $document['checksum']],
        );
    }

    private function batchSize(): int
    {
        return min(100, max(1, (int) config('guaranda.assistant.openai.embedding_batch_size', 50)));
    }
}
