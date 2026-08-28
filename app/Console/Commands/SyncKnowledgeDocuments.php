<?php

namespace App\Console\Commands;

use App\Jobs\SyncKnowledgeProjection;
use App\Services\Ai\KnowledgeProjectionSynchronizer;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('ai:knowledge:sync {--now : Genera los embeddings durante este proceso, sin usar la cola} {--force : Regenera documentos aunque su checksum no cambie}')]
#[Description('Sincroniza la proyección vectorial de rutas, POIs y alertas públicas.')]
class SyncKnowledgeDocuments extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(KnowledgeProjectionSynchronizer $synchronizer): int
    {
        if (! $synchronizer->configured()) {
            $this->error('La sincronización requiere PostgreSQL con pgvector y OPENAI_API_KEY configurada.');

            return self::FAILURE;
        }

        if (! $this->option('now')) {
            SyncKnowledgeProjection::dispatch((bool) $this->option('force'));
            $this->info('Sincronización vectorial enviada a la cola.');

            return self::SUCCESS;
        }

        $result = $synchronizer->sync((bool) $this->option('force'));
        $this->table(['Total', 'Generados', 'Sin cambios', 'Eliminados'], [[
            $result['total'],
            $result['embedded'],
            $result['unchanged'],
            $result['deleted'],
        ]]);

        return self::SUCCESS;
    }
}
