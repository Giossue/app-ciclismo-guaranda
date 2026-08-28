<?php

namespace App\Services\Ai;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Throwable;

class SemanticKnowledgeRetriever
{
    public function __construct(private readonly OpenAiEmbeddings $embeddings) {}

    /**
     * @return array{route_ids: list<int>, poi_ids: list<int>, incident_ids: list<int>}
     */
    public function references(string $message): array
    {
        $empty = ['route_ids' => [], 'poi_ids' => [], 'incident_ids' => []];

        if (trim($message) === '' || ! $this->available()) {
            return $empty;
        }

        try {
            $vector = $this->embeddings->embed([$message])[0];
            $literal = '['.implode(',', array_map(fn (float $value): string => sprintf('%.8F', $value), $vector)).']';
            $rows = DB::select(
                'SELECT source_type, source_id, metadata FROM documentos_conocimiento_ia WHERE embedding IS NOT NULL ORDER BY embedding <=> CAST(? AS halfvec) LIMIT 6',
                [$literal],
            );

            foreach ($rows as $row) {
                $sourceId = is_numeric($row->source_id ?? null) ? (int) $row->source_id : null;

                if ($sourceId === null || $sourceId < 1) {
                    continue;
                }

                match ($row->source_type ?? null) {
                    'route' => $empty['route_ids'][] = $sourceId,
                    'poi' => $empty['poi_ids'][] = $sourceId,
                    'incident' => $empty['incident_ids'][] = $sourceId,
                    default => null,
                };

                $metadata = $this->metadata($row->metadata ?? null);
                if (is_int($metadata['route_id'] ?? null)) {
                    $empty['route_ids'][] = $metadata['route_id'];
                }
            }
        } catch (Throwable $exception) {
            Log::notice('Semantic knowledge retrieval unavailable', [
                'exception' => $exception::class,
            ]);
        }

        return [
            'route_ids' => array_values(array_unique($empty['route_ids'])),
            'poi_ids' => array_values(array_unique($empty['poi_ids'])),
            'incident_ids' => array_values(array_unique($empty['incident_ids'])),
        ];
    }

    private function available(): bool
    {
        return DB::getDriverName() === 'pgsql'
            && Schema::hasTable('documentos_conocimiento_ia')
            && $this->embeddings->configured();
    }

    /**
     * @return array<string, mixed>
     */
    private function metadata(mixed $metadata): array
    {
        if (is_array($metadata)) {
            return $metadata;
        }

        if (! is_string($metadata)) {
            return [];
        }

        $decoded = json_decode($metadata, true);

        return is_array($decoded) ? $decoded : [];
    }
}
