<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tipos_incidencia', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('estados_incidencia', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('incidencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('route_id')->constrained('rutas')->restrictOnDelete();
            $table->foreignId('incident_type_id')->constrained('tipos_incidencia')->restrictOnDelete();
            $table->foreignId('incident_status_id')->constrained('estados_incidencia')->restrictOnDelete();
            $table->string('title');
            $table->text('description');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->timestamp('reported_at')->useCurrent();
            $table->timestamp('resolved_at')->nullable();
            $table->text('admin_response')->nullable();
            $table->timestamps();

            $table->index(['route_id', 'incident_status_id']);
        });

        if ($this->supportsPostgis()) {
            DB::statement('ALTER TABLE incidencias ADD COLUMN geom geometry(Point, 4326)');
            DB::statement('CREATE INDEX incidencias_geom_gist ON incidencias USING GIST (geom)');
        }

        Schema::create('archivos_incidencia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('incident_id')->constrained('incidencias')->cascadeOnDelete();
            $table->string('file_path');
            $table->string('file_type')->default('image');
            $table->unsignedInteger('size_bytes')->nullable();
            $table->timestamp('uploaded_at')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('archivos_incidencia');
        Schema::dropIfExists('incidencias');
        Schema::dropIfExists('estados_incidencia');
        Schema::dropIfExists('tipos_incidencia');
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
