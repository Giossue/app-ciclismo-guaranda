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
        Schema::create('dificultades_ruta', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('estados_ruta', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('categorias_ruta', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('motores_enrutamiento', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('medios_transporte', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('rutas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_user_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->foreignId('route_difficulty_id')->constrained('dificultades_ruta')->restrictOnDelete();
            $table->foreignId('route_status_id')->constrained('estados_ruta')->restrictOnDelete();
            $table->foreignId('route_category_id')->constrained('categorias_ruta')->restrictOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('start_name');
            $table->decimal('start_latitude', 10, 7);
            $table->decimal('start_longitude', 10, 7);
            $table->string('end_name');
            $table->decimal('end_latitude', 10, 7);
            $table->decimal('end_longitude', 10, 7);
            $table->string('road_type')->nullable();
            $table->text('required_experience')->nullable();
            $table->string('main_image_path')->nullable();
            $table->unsignedInteger('route_version')->default(1);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['route_status_id', 'route_category_id']);
        });

        Schema::create('imagenes_ruta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->constrained('rutas')->cascadeOnDelete();
            $table->string('image_path');
            $table->text('description')->nullable();
            $table->boolean('is_main')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('geometrias_ruta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->unique()->constrained('rutas')->cascadeOnDelete();
            $table->jsonb('geojson');
            $table->timestamps();
        });

        if ($this->supportsPostgis()) {
            DB::statement('ALTER TABLE geometrias_ruta ADD COLUMN geom geometry(LineString, 4326)');
            DB::statement('CREATE INDEX geometrias_ruta_geom_gist ON geometrias_ruta USING GIST (geom)');
        }

        Schema::create('metricas_ruta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->constrained('rutas')->cascadeOnDelete();
            $table->unsignedInteger('route_version');
            $table->foreignId('transport_mode_id')->constrained('medios_transporte')->restrictOnDelete();
            $table->foreignId('routing_engine_id')->nullable()->constrained('motores_enrutamiento')->nullOnDelete();
            $table->decimal('distance_km', 8, 3);
            $table->unsignedInteger('estimated_time_minutes');
            $table->decimal('positive_elevation_m', 9, 2)->default(0);
            $table->decimal('negative_elevation_m', 9, 2)->default(0);
            $table->timestamp('calculated_at')->nullable();
            $table->timestamps();

            $table->unique(['route_id', 'route_version', 'transport_mode_id', 'routing_engine_id'], 'metricas_ruta_unique_calculation');
        });

        Schema::create('recomendaciones_ruta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->constrained('rutas')->cascadeOnDelete();
            $table->text('text');
            $table->timestamps();
        });

        Schema::create('observaciones_ruta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->constrained('rutas')->cascadeOnDelete();
            $table->text('text');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('observaciones_ruta');
        Schema::dropIfExists('recomendaciones_ruta');
        Schema::dropIfExists('metricas_ruta');
        Schema::dropIfExists('geometrias_ruta');
        Schema::dropIfExists('imagenes_ruta');
        Schema::dropIfExists('rutas');
        Schema::dropIfExists('medios_transporte');
        Schema::dropIfExists('motores_enrutamiento');
        Schema::dropIfExists('categorias_ruta');
        Schema::dropIfExists('estados_ruta');
        Schema::dropIfExists('dificultades_ruta');
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
