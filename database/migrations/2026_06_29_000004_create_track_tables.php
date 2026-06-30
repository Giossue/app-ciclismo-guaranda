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
        Schema::create('estados_recorrido', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('recorridos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('route_id')->constrained('rutas')->restrictOnDelete();
            $table->foreignId('track_status_id')->constrained('estados_recorrido')->restrictOnDelete();
            $table->timestamp('started_at');
            $table->timestamp('ended_at')->nullable();
            $table->decimal('distance_traveled_km', 10, 3)->default(0);
            $table->unsignedInteger('total_time_seconds')->default(0);
            $table->decimal('completion_percentage', 5, 2)->default(0);
            $table->boolean('is_valid')->default(false)->index();
            $table->jsonb('summary')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'route_id']);
        });

        Schema::create('puntos_gps_recorrido', function (Blueprint $table) {
            $table->id();
            $table->foreignId('track_id')->constrained('recorridos')->cascadeOnDelete();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->decimal('elevation_m', 9, 2)->nullable();
            $table->decimal('speed_kmh', 8, 3)->nullable();
            $table->decimal('accuracy_m', 8, 2)->nullable();
            $table->timestamp('recorded_at');
            $table->timestamps();

            $table->index(['track_id', 'recorded_at']);
        });

        if ($this->supportsPostgis()) {
            DB::statement('ALTER TABLE puntos_gps_recorrido ADD COLUMN geom geometry(Point, 4326)');
            DB::statement('CREATE INDEX puntos_gps_recorrido_geom_gist ON puntos_gps_recorrido USING GIST (geom)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('puntos_gps_recorrido');
        Schema::dropIfExists('recorridos');
        Schema::dropIfExists('estados_recorrido');
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
