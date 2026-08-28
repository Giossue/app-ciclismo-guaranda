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
            ['name' => 'Ciclista', 'description' => 'Usuario que consulta rutas, registra recorridos, reporta incidencias y valora experiencias.'],
            ['name' => 'Administrador', 'description' => 'Usuario con permisos para gestionar rutas, POIs, incidencias, usuarios y reportes.'],
        ]);

        $this->seedCatalog(Gender::class, [
            ['name' => Gender::MASCULINE],
            ['name' => Gender::FEMININE],
        ]);

        $this->seedCatalog(RouteStatus::class, [
            ['name' => 'Borrador', 'description' => 'Ruta en preparación, no visible para ciclistas.'],
            ['name' => 'Activa', 'description' => 'Ruta publicada y disponible para uso.'],
            ['name' => 'Inactiva', 'description' => 'Ruta deshabilitada temporalmente.'],
        ]);

        $this->seedCatalog(RouteDifficulty::class, [
            ['name' => 'Fácil', 'description' => 'Ruta recomendada para usuarios principiantes o recorridos familiares.'],
            ['name' => 'Media', 'description' => 'Ruta con exigencia moderada de distancia, pendiente o superficie.'],
            ['name' => 'Difícil', 'description' => 'Ruta exigente para ciclistas con experiencia.'],
        ]);

        $this->seedCatalog(RouteCategory::class, [
            ['name' => 'Familiar', 'description' => 'Ruta apta para recorridos recreativos o familiares.'],
            ['name' => 'MTB', 'description' => 'Ruta orientada a ciclismo de montaña.'],
            ['name' => 'Urbana', 'description' => 'Ruta dentro o cerca de zonas urbanas.'],
            ['name' => 'Montaña', 'description' => 'Ruta con terreno andino, pendientes o caminos rurales.'],
            ['name' => 'Turística', 'description' => 'Ruta enfocada en atractivos culturales, naturales o gastronómicos.'],
        ]);

        $this->seedCatalog(RoutingEngine::class, [
            ['name' => 'OSRM', 'active' => true],
            ['name' => 'GraphHopper', 'active' => true],
            ['name' => 'OpenRouteService', 'active' => true],
        ]);

        $this->seedCatalog(TransportMode::class, [
            ['name' => 'Bicicleta'],
            ['name' => 'Caminata'],
        ]);

        $this->seedCatalog(PoiCategory::class, [
            ['name' => 'Comida', 'description' => 'Restaurantes, cafeterías y paradas gastronómicas.'],
            ['name' => 'Tienda', 'description' => 'Tiendas útiles para abastecimiento durante la ruta.'],
            ['name' => 'Taller', 'description' => 'Talleres o puntos de asistencia mecánica.'],
            ['name' => 'Salud', 'description' => 'Centros de salud, hospitales, clínicas o puntos de asistencia.'],
            ['name' => 'Hospedaje', 'description' => 'Lugares para alojamiento de ciclistas o turistas.'],
            ['name' => 'Mirador', 'description' => 'Puntos panorámicos o atractivos de observación.'],
        ]);

        $this->seedCatalog(PriceRange::class, [
            ['name' => 'Económico', 'description' => 'Opciones de bajo costo.'],
            ['name' => 'Moderado', 'description' => 'Opciones de costo medio.'],
            ['name' => 'Alto', 'description' => 'Opciones de costo alto.'],
        ]);

        $this->seedCatalog(CuisineType::class, [
            ['name' => 'Ecuatoriana'],
            ['name' => 'Comida rápida'],
            ['name' => 'Cafetería'],
            ['name' => 'Vegetariana'],
            ['name' => 'Internacional'],
        ]);

        $this->seedCatalog(LodgingType::class, [
            ['name' => 'Hotel'],
            ['name' => 'Hostal'],
            ['name' => 'Hostería'],
            ['name' => 'Casa de huéspedes'],
            ['name' => 'Camping'],
        ]);

        $this->seedCatalog(StoreType::class, [
            ['name' => 'Tienda de abarrotes'],
            ['name' => 'Minimarket'],
            ['name' => 'Supermercado'],
            ['name' => 'Tienda deportiva'],
            ['name' => 'Farmacia'],
        ]);

        $this->seedCatalog(WorkshopSpecialty::class, [
            ['name' => 'Bicicletas'],
            ['name' => 'Frenos'],
            ['name' => 'Transmisión'],
            ['name' => 'Suspensión'],
            ['name' => 'Llantas'],
        ]);

        $this->seedCatalog(WorkshopService::class, [
            ['name' => 'Reparación básica'],
            ['name' => 'Inflado de llantas'],
            ['name' => 'Cambio de tubo'],
            ['name' => 'Ajuste de frenos'],
            ['name' => 'Lubricación de cadena'],
            ['name' => 'Venta de repuestos'],
        ]);

        $this->seedCatalog(HealthCenterType::class, [
            ['name' => 'Hospital'],
            ['name' => 'Centro de salud'],
            ['name' => 'Clínica'],
            ['name' => 'Farmacia'],
            ['name' => 'Puesto de auxilio'],
        ]);

        $this->seedCatalog(TrackStatus::class, [
            ['name' => 'En curso'],
            ['name' => 'Pausado'],
            ['name' => 'Finalizado'],
            ['name' => 'Cancelado'],
        ]);

        $this->seedCatalog(IncidentType::class, [
            ['name' => 'Derrumbe'],
            ['name' => 'Obstáculo'],
            ['name' => 'Vía cerrada'],
            ['name' => 'Inseguridad'],
            ['name' => 'Accidente'],
            ['name' => 'Daño en señalética'],
        ]);

        $this->seedCatalog(IncidentStatus::class, [
            ['name' => 'Reportada'],
            ['name' => 'En revisión'],
            ['name' => 'Resuelta'],
            ['name' => 'Descartada'],
        ]);

        $this->seedCatalog(ModerationStatus::class, [
            ['name' => 'Pendiente'],
            ['name' => 'Aprobado'],
            ['name' => 'Oculto'],
            ['name' => 'Rechazado'],
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
