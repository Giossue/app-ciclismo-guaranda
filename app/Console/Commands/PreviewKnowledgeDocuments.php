<?php

namespace App\Console\Commands;

use App\Services\Ai\KnowledgeDocumentBuilder;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('ai:knowledge:preview {--limit=20 : Número máximo de fragmentos a mostrar (1-100)}')]
#[Description('Muestra por lectura los documentos públicos candidatos al índice vectorial.')]
class PreviewKnowledgeDocuments extends Command
{
    /**
     * Execute the console command without writing documents or embeddings.
     */
    public function handle(KnowledgeDocumentBuilder $documents): int
    {
        $limit = filter_var($this->option('limit'), FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1, 'max_range' => 100],
        ]);

        if ($limit === false) {
            $this->error('La opción --limit debe ser un entero entre 1 y 100.');

            return self::INVALID;
        }

        $projection = $documents->all();
        $this->info("Documentos públicos listos para indexar: {$projection->count()}");

        if ($projection->isEmpty()) {
            $this->line('No hay rutas activas, POIs activos ni alertas visibles para indexar.');

            return self::SUCCESS;
        }

        $this->table(
            ['Tipo', 'Origen', 'Sección', 'Contenido'],
            $projection
                ->take($limit)
                ->map(fn (array $document): array => [
                    $document['source_type'],
                    (string) $document['source_id'],
                    $document['section'],
                    str($document['content'])->squish()->limit(120),
                ])
                ->all(),
        );

        if ($projection->count() > $limit) {
            $this->line("Mostrando {$limit} de {$projection->count()} fragmentos. Usa --limit=N para ajustar la vista.");
        }

        $this->comment('Solo lectura: no se generaron embeddings ni se modificó la base de datos.');

        return self::SUCCESS;
    }
}
