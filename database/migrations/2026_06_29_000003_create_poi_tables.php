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
        Schema::create('categorias_poi', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('rangos_precio', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('tipos_cocina', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('tipos_hospedaje', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('tipos_tienda', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('especialidades_taller', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('servicios_taller', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('tipos_centro_salud', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('puntos_interes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('poi_category_id')->constrained('categorias_poi')->restrictOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->text('observations')->nullable();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->boolean('active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        if ($this->supportsPostgis()) {
            DB::statement('ALTER TABLE puntos_interes ADD COLUMN geom geometry(Point, 4326)');
            DB::statement('CREATE INDEX puntos_interes_geom_gist ON puntos_interes USING GIST (geom)');
        }

        Schema::create('ruta_punto_interes', function (Blueprint $table) {
            $table->foreignId('route_id')->constrained('rutas')->cascadeOnDelete();
            $table->foreignId('point_of_interest_id')->constrained('puntos_interes')->cascadeOnDelete();
            $table->unsignedInteger('sort_order')->nullable();
            $table->boolean('is_required')->default(false);
            $table->decimal('distance_from_start_km', 8, 3)->nullable();
            $table->text('route_observation')->nullable();
            $table->timestamps();

            $table->primary(['route_id', 'point_of_interest_id'], 'route_poi_primary');
        });

        Schema::create('horarios_punto_interes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('point_of_interest_id')->constrained('puntos_interes')->cascadeOnDelete();
            $table->unsignedTinyInteger('weekday');
            $table->time('opens_at')->nullable();
            $table->time('closes_at')->nullable();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('imagenes_punto_interes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('point_of_interest_id')->constrained('puntos_interes')->cascadeOnDelete();
            $table->string('image_path');
            $table->text('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('sugerencias_punto_interes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('poi_category_id')->nullable()->constrained('categorias_poi')->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('status')->default('pendiente')->index();
            $table->timestamp('suggested_at')->useCurrent();
            $table->timestamps();
        });

        Schema::create('reportes_punto_interes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('point_of_interest_id')->constrained('puntos_interes')->cascadeOnDelete();
            $table->string('report_type');
            $table->text('description')->nullable();
            $table->string('status')->default('pendiente')->index();
            $table->timestamp('reported_at')->useCurrent();
            $table->timestamps();
        });

        Schema::create('detalles_comida', function (Blueprint $table) {
            $table->foreignId('point_of_interest_id')->primary()->constrained('puntos_interes')->cascadeOnDelete();
            $table->foreignId('cuisine_type_id')->nullable()->constrained('tipos_cocina')->nullOnDelete();
            $table->foreignId('price_range_id')->nullable()->constrained('rangos_precio')->nullOnDelete();
            $table->boolean('is_pet_friendly')->default(false);
            $table->boolean('has_wifi')->default(false);
            $table->string('accepted_payment_type')->nullable();
            $table->boolean('has_bike_parking')->default(false);
            $table->text('chef_recommendation')->nullable();
            $table->string('menu_url')->nullable();
            $table->timestamps();
        });

        Schema::create('detalles_hospedaje', function (Blueprint $table) {
            $table->foreignId('point_of_interest_id')->primary()->constrained('puntos_interes')->cascadeOnDelete();
            $table->foreignId('lodging_type_id')->nullable()->constrained('tipos_hospedaje')->nullOnDelete();
            $table->boolean('allows_bikes_in_room')->default(false);
            $table->boolean('has_bike_wash_area')->default(false);
            $table->decimal('base_price', 10, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('detalles_tienda', function (Blueprint $table) {
            $table->foreignId('point_of_interest_id')->primary()->constrained('puntos_interes')->cascadeOnDelete();
            $table->foreignId('store_type_id')->nullable()->constrained('tipos_tienda')->nullOnDelete();
            $table->boolean('sells_hydration')->default(false);
            $table->boolean('sells_snacks')->default(false);
            $table->string('accepted_payment_type')->nullable();
            $table->timestamps();
        });

        Schema::create('detalles_taller', function (Blueprint $table) {
            $table->foreignId('point_of_interest_id')->primary()->constrained('puntos_interes')->cascadeOnDelete();
            $table->foreignId('workshop_specialty_id')->nullable()->constrained('especialidades_taller')->nullOnDelete();
            $table->boolean('emergency_service')->default(false);
            $table->string('emergency_phone')->nullable();
            $table->timestamps();
        });

        Schema::create('detalle_taller_servicio', function (Blueprint $table) {
            $table->unsignedBigInteger('point_of_interest_id');
            $table->foreignId('workshop_service_id')->constrained('servicios_taller')->cascadeOnDelete();
            $table->timestamps();

            $table->foreign('point_of_interest_id')->references('point_of_interest_id')->on('detalles_taller')->cascadeOnDelete();
            $table->primary(['point_of_interest_id', 'workshop_service_id'], 'workshop_detail_service_primary');
        });

        Schema::create('detalles_salud', function (Blueprint $table) {
            $table->foreignId('point_of_interest_id')->primary()->constrained('puntos_interes')->cascadeOnDelete();
            $table->foreignId('health_center_type_id')->nullable()->constrained('tipos_centro_salud')->nullOnDelete();
            $table->boolean('has_defibrillator')->default(false);
            $table->unsignedTinyInteger('care_level')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detalles_salud');
        Schema::dropIfExists('detalle_taller_servicio');
        Schema::dropIfExists('detalles_taller');
        Schema::dropIfExists('detalles_tienda');
        Schema::dropIfExists('detalles_hospedaje');
        Schema::dropIfExists('detalles_comida');
        Schema::dropIfExists('reportes_punto_interes');
        Schema::dropIfExists('sugerencias_punto_interes');
        Schema::dropIfExists('imagenes_punto_interes');
        Schema::dropIfExists('horarios_punto_interes');
        Schema::dropIfExists('ruta_punto_interes');
        Schema::dropIfExists('puntos_interes');
        Schema::dropIfExists('tipos_centro_salud');
        Schema::dropIfExists('servicios_taller');
        Schema::dropIfExists('especialidades_taller');
        Schema::dropIfExists('tipos_tienda');
        Schema::dropIfExists('tipos_hospedaje');
        Schema::dropIfExists('tipos_cocina');
        Schema::dropIfExists('rangos_precio');
        Schema::dropIfExists('categorias_poi');
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
