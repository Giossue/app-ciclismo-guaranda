<?php

namespace App\Services\Ai;

use Illuminate\Database\Connection;
use Throwable;

class VectorRuntimeInspector
{
    /**
     * Reads PostgreSQL extension metadata and probes extension loading. It never
     * installs an extension or changes application data/schema.
     *
     * @return array{driver: string, postgis_installed: bool, postgis_version: string|null, postgis_runtime: string, vector_available: bool, vector_version: string|null, vector_runtime: string}
     */
    public function inspect(Connection $connection): array
    {
        $driver = $connection->getDriverName();

        if ($driver !== 'pgsql') {
            return $this->unavailable($driver, 'no_postgresql');
        }

        try {
            $extension = $connection->selectOne("select
                pg_available_extensions.name is not null as vector_available,
                installed_vector.extversion as vector_version,
                installed_postgis.extversion as postgis_version
                from (select 'vector' as name) as available
                left join pg_available_extensions on pg_available_extensions.name = available.name
                left join pg_extension as installed_vector on installed_vector.extname = 'vector'
                left join pg_extension as installed_postgis on installed_postgis.extname = 'postgis'");
            $vectorVersion = is_string($extension?->vector_version ?? null) ? $extension->vector_version : null;
            $postgisVersion = is_string($extension?->postgis_version ?? null) ? $extension->postgis_version : null;

            return [
                'driver' => $driver,
                'postgis_installed' => $postgisVersion !== null,
                'postgis_version' => $postgisVersion,
                'postgis_runtime' => $postgisVersion === null
                    ? 'not_installed'
                    : $this->probe($connection, 'select postgis_lib_version() as probe'),
                'vector_available' => (bool) ($extension?->vector_available ?? false),
                'vector_version' => $vectorVersion,
                'vector_runtime' => $vectorVersion === null
                    ? 'not_installed'
                    : $this->probe($connection, "select '[0,0,0]'::vector as probe"),
            ];
        } catch (Throwable) {
            return $this->unavailable($driver, 'error');
        }
    }

    private function probe(Connection $connection, string $query): string
    {
        try {
            $connection->selectOne($query);

            return 'ok';
        } catch (Throwable) {
            return 'error';
        }
    }

    /**
     * @return array{driver: string, postgis_installed: bool, postgis_version: null, postgis_runtime: string, vector_available: bool, vector_version: null, vector_runtime: string}
     */
    private function unavailable(string $driver, string $runtime): array
    {
        return [
            'driver' => $driver,
            'postgis_installed' => false,
            'postgis_version' => null,
            'postgis_runtime' => $runtime,
            'vector_available' => false,
            'vector_version' => null,
            'vector_runtime' => $runtime,
        ];
    }
}
