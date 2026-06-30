<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! $this->supportsPostgis()) {
            return;
        }

        if (! Schema::hasColumn('geometrias_ruta', 'geom')) {
            DB::statement('ALTER TABLE geometrias_ruta ADD COLUMN geom geometry(LineString, 4326)');
            DB::statement('CREATE INDEX geometrias_ruta_geom_gist ON geometrias_ruta USING GIST (geom)');
        }

        if (! Schema::hasColumn('puntos_interes', 'geom')) {
            DB::statement('ALTER TABLE puntos_interes ADD COLUMN geom geometry(Point, 4326)');
            DB::statement('CREATE INDEX puntos_interes_geom_gist ON puntos_interes USING GIST (geom)');
        }

        if (! Schema::hasColumn('puntos_gps_recorrido', 'geom')) {
            DB::statement('ALTER TABLE puntos_gps_recorrido ADD COLUMN geom geometry(Point, 4326)');
            DB::statement('CREATE INDEX puntos_gps_recorrido_geom_gist ON puntos_gps_recorrido USING GIST (geom)');
        }

        if (! Schema::hasColumn('incidencias', 'geom')) {
            DB::statement('ALTER TABLE incidencias ADD COLUMN geom geometry(Point, 4326)');
            DB::statement('CREATE INDEX incidencias_geom_gist ON incidencias USING GIST (geom)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('DROP INDEX IF EXISTS incidencias_geom_gist');
        DB::statement('DROP INDEX IF EXISTS puntos_gps_recorrido_geom_gist');
        DB::statement('DROP INDEX IF EXISTS puntos_interes_geom_gist');
        DB::statement('DROP INDEX IF EXISTS geometrias_ruta_geom_gist');

        if (Schema::hasColumn('incidencias', 'geom')) {
            DB::statement('ALTER TABLE incidencias DROP COLUMN geom');
        }

        if (Schema::hasColumn('puntos_gps_recorrido', 'geom')) {
            DB::statement('ALTER TABLE puntos_gps_recorrido DROP COLUMN geom');
        }

        if (Schema::hasColumn('puntos_interes', 'geom')) {
            DB::statement('ALTER TABLE puntos_interes DROP COLUMN geom');
        }

        if (Schema::hasColumn('geometrias_ruta', 'geom')) {
            DB::statement('ALTER TABLE geometrias_ruta DROP COLUMN geom');
        }
    }

    private function supportsPostgis(): bool
    {
        if (DB::getDriverName() !== 'pgsql') {
            return false;
        }

        $result = DB::selectOne("SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') AS enabled");

        return (bool) $result->enabled;
    }
};
