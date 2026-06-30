<?php

namespace Database\Seeders;

use App\Models\CuisineType;
use App\Models\ExportFormat;
use App\Models\Gender;
use App\Models\HealthCenterType;
use App\Models\IncidentStatus;
use App\Models\IncidentType;
use App\Models\LodgingType;
use App\Models\ModerationStatus;
use App\Models\PoiCategory;
use App\Models\PriceRange;
use App\Models\RouteCategory;
use App\Models\RouteDifficulty;
use App\Models\RouteStatus;
use App\Models\RoutingEngine;
use App\Models\StoreType;
use App\Models\TrackStatus;
use App\Models\TransportMode;
use App\Models\UserRole;
use App\Models\WorkshopService;
use App\Models\WorkshopSpecialty;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->seedCatalog(UserRole::class, [
            ['name' => 'ciclista', 'description' => 'Usuario que consulta rutas, registra recorridos, reporta incidencias y valora experiencias.'],
            ['name' => 'administrador', 'description' => 'Usuario con permisos para gestionar rutas, POIs, incidencias, usuarios y reportes.'],
        ]);

        $this->seedCatalog(Gender::class, [
            ['name' => Gender::MASCULINE],
            ['name' => Gender::FEMININE],
        ]);

        $this->seedCatalog(RouteStatus::class, [
            ['name' => 'borrador', 'description' => 'Ruta en preparación, no visible para ciclistas.'],
            ['name' => 'activa', 'description' => 'Ruta publicada y disponible para uso.'],
            ['name' => 'inactiva', 'description' => 'Ruta deshabilitada temporalmente.'],
        ]);

        $this->seedCatalog(RouteDifficulty::class, [
            ['name' => 'fácil', 'description' => 'Ruta recomendada para usuarios principiantes o recorridos familiares.'],
            ['name' => 'media', 'description' => 'Ruta con exigencia moderada de distancia, pendiente o superficie.'],
            ['name' => 'difícil', 'description' => 'Ruta exigente para ciclistas con experiencia.'],
        ]);

        $this->seedCatalog(RouteCategory::class, [
            ['name' => 'familiar', 'description' => 'Ruta apta para recorridos recreativos o familiares.'],
            ['name' => 'MTB', 'description' => 'Ruta orientada a ciclismo de montaña.'],
            ['name' => 'urbana', 'description' => 'Ruta dentro o cerca de zonas urbanas.'],
            ['name' => 'montaña', 'description' => 'Ruta con terreno andino, pendientes o caminos rurales.'],
            ['name' => 'turística', 'description' => 'Ruta enfocada en atractivos culturales, naturales o gastronómicos.'],
        ]);

        $this->seedCatalog(RoutingEngine::class, [
            ['name' => 'OSRM', 'active' => true],
            ['name' => 'GraphHopper', 'active' => true],
            ['name' => 'OpenRouteService', 'active' => true],
        ]);

        $this->seedCatalog(TransportMode::class, [
            ['name' => 'bicicleta'],
            ['name' => 'caminata'],
        ]);

        $this->seedCatalog(PoiCategory::class, [
            ['name' => 'comida', 'description' => 'Restaurantes, cafeterías y paradas gastronómicas.'],
            ['name' => 'tienda', 'description' => 'Tiendas útiles para abastecimiento durante la ruta.'],
            ['name' => 'taller', 'description' => 'Talleres o puntos de asistencia mecánica.'],
            ['name' => 'salud', 'description' => 'Centros de salud, hospitales, clínicas o puntos de asistencia.'],
            ['name' => 'hospedaje', 'description' => 'Lugares para alojamiento de ciclistas o turistas.'],
            ['name' => 'mirador', 'description' => 'Puntos panorámicos o atractivos de observación.'],
        ]);

        $this->seedCatalog(PriceRange::class, [
            ['name' => 'económico', 'description' => 'Opciones de bajo costo.'],
            ['name' => 'moderado', 'description' => 'Opciones de costo medio.'],
            ['name' => 'alto', 'description' => 'Opciones de costo alto.'],
        ]);

        $this->seedCatalog(CuisineType::class, [
            ['name' => 'ecuatoriana'],
            ['name' => 'comida rápida'],
            ['name' => 'cafetería'],
            ['name' => 'vegetariana'],
            ['name' => 'internacional'],
        ]);

        $this->seedCatalog(LodgingType::class, [
            ['name' => 'hotel'],
            ['name' => 'hostal'],
            ['name' => 'hostería'],
            ['name' => 'casa de huéspedes'],
            ['name' => 'camping'],
        ]);

        $this->seedCatalog(StoreType::class, [
            ['name' => 'tienda de abarrotes'],
            ['name' => 'minimarket'],
            ['name' => 'supermercado'],
            ['name' => 'tienda deportiva'],
            ['name' => 'farmacia'],
        ]);

        $this->seedCatalog(WorkshopSpecialty::class, [
            ['name' => 'bicicletas'],
            ['name' => 'frenos'],
            ['name' => 'transmisión'],
            ['name' => 'suspensión'],
            ['name' => 'llantas'],
        ]);

        $this->seedCatalog(WorkshopService::class, [
            ['name' => 'reparación básica'],
            ['name' => 'inflado de llantas'],
            ['name' => 'cambio de tubo'],
            ['name' => 'ajuste de frenos'],
            ['name' => 'lubricación de cadena'],
            ['name' => 'venta de repuestos'],
        ]);

        $this->seedCatalog(HealthCenterType::class, [
            ['name' => 'hospital'],
            ['name' => 'centro de salud'],
            ['name' => 'clínica'],
            ['name' => 'farmacia'],
            ['name' => 'puesto de auxilio'],
        ]);

        $this->seedCatalog(TrackStatus::class, [
            ['name' => 'en curso'],
            ['name' => 'pausado'],
            ['name' => 'finalizado'],
            ['name' => 'cancelado'],
        ]);

        $this->seedCatalog(IncidentType::class, [
            ['name' => 'derrumbe'],
            ['name' => 'obstáculo'],
            ['name' => 'vía cerrada'],
            ['name' => 'inseguridad'],
            ['name' => 'accidente'],
            ['name' => 'daño en señalética'],
        ]);

        $this->seedCatalog(IncidentStatus::class, [
            ['name' => 'reportada'],
            ['name' => 'en revisión'],
            ['name' => 'resuelta'],
            ['name' => 'descartada'],
        ]);

        $this->seedCatalog(ModerationStatus::class, [
            ['name' => 'pendiente'],
            ['name' => 'aprobado'],
            ['name' => 'oculto'],
            ['name' => 'rechazado'],
        ]);

        $this->seedCatalog(ExportFormat::class, [
            ['name' => 'GPX'],
            ['name' => 'GeoJSON'],
        ]);
    }

    /**
     * @param  class-string<Model>  $modelClass
     * @param  list<array{name: string, description?: string, active?: bool}>  $records
     */
    private function seedCatalog(string $modelClass, array $records): void
    {
        foreach ($records as $record) {
            $name = $record['name'];
            unset($record['name']);

            $modelClass::updateOrCreate(['name' => $name], $record);
        }
    }
}
