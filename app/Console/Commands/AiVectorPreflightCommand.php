<?php

namespace App\Console\Commands;

use App\Services\Ai\VectorRuntimeInspector;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

#[Signature('ai:vector-preflight {--connection= : Nombre de conexión Laravel a verificar}')]
#[Description('Verifica pgvector y PostGIS sin cambiar el esquema ni los datos')]
class AiVectorPreflightCommand extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(VectorRuntimeInspector $inspector): int
    {
        $connectionName = $this->option('connection');
        $connection = DB::connection(is_string($connectionName) && $connectionName !== '' ? $connectionName : null);
        $capabilities = $inspector->inspect($connection);

        if ($capabilities['driver'] !== 'pgsql') {
            $this->error('El preflight vectorial requiere una conexión PostgreSQL; no se ejecutó ninguna consulta de extensión.');

            return self::FAILURE;
        }

        $this->table(
            ['Comprobación', 'Resultado'],
            [
                ['Conexión', $connection->getDatabaseName()],
                ['pgvector disponible para instalar', $capabilities['vector_available'] ? 'sí' : 'no'],
                ['pgvector instalado', $capabilities['vector_version'] ?? 'no'],
                ['Runtime pgvector', $capabilities['vector_runtime']],
                ['PostGIS instalado', $capabilities['postgis_version'] ?? 'no'],
                ['Runtime PostGIS', $capabilities['postgis_runtime']],
            ],
        );

        if ($capabilities['vector_runtime'] !== 'ok') {
            $this->warn('No se habilitó ni alteró nada. No ejecute migraciones vectoriales hasta que Runtime pgvector sea ok.');

            return self::FAILURE;
        }

        $this->info('Preflight correcto. La extensión vector está disponible en runtime; aún no se modificó el esquema.');

        return self::SUCCESS;
    }
}
