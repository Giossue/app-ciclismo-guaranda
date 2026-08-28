<?php

use App\Models\CyclingRoute;
use App\Models\FavoriteRoute;
use App\Models\IncidentStatus;
use App\Models\IncidentType;
use App\Models\PoiCategory;
use App\Models\PointOfInterest;
use App\Models\RouteCategory;
use App\Models\RouteDifficulty;
use App\Models\RouteStatus;
use App\Models\TransportMode;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('guest is redirected from the cyclist map explorer', function () {
    $this->get(route('maps.index'))
        ->assertRedirect(route('login'));
});

function createRouteForMapVisualization(string $statusName = 'Activa'): CyclingRoute
{
    $admin = User::factory()->administrator()->create();
    $cyclist = User::factory()->cyclist()->create();
    $status = RouteStatus::query()->where('name', $statusName)->firstOrFail();
    $category = RouteCategory::query()->where('name', 'Turística')->firstOrFail();
    $difficulty = RouteDifficulty::query()->where('name', 'Media')->firstOrFail();
    $transportMode = TransportMode::query()->where('name', 'Bicicleta')->firstOrFail();

    $route = CyclingRoute::query()->create([
        'admin_user_id' => $admin->id,
        'route_difficulty_id' => $difficulty->id,
        'route_status_id' => $status->id,
        'route_category_id' => $category->id,
        'name' => 'Ruta mapa Salinas',
        'slug' => "ruta-mapa-salinas-{$statusName}",
        'description' => 'Ruta con trazado GeoJSON, POIs e incidencias para validar visualización en mapa.',
        'start_name' => 'Inicio Salinas',
        'start_latitude' => -1.4,
        'start_longitude' => -79.016,
        'end_name' => 'Final Salinas',
        'end_latitude' => -1.41,
        'end_longitude' => -79.026,
        'road_type' => 'Asfalto y lastre',
        'required_experience' => 'Experiencia media.',
        'main_image_path' => 'routes/mapa-salinas.jpg',
        'route_version' => 1,
    ]);

    $route->geometry()->create([
        'geojson' => [
            'type' => 'LineString',
            'coordinates' => [[-79.016, -1.4], [-79.021, -1.405], [-79.026, -1.41]],
        ],
    ]);

    $route->metrics()->create([
        'route_version' => 1,
        'transport_mode_id' => $transportMode->id,
        'distance_km' => 9.75,
        'estimated_time_minutes' => 70,
        'positive_elevation_m' => 320,
        'negative_elevation_m' => 120,
        'calculated_at' => now(),
    ]);

    $route->recommendations()->createMany([
        ['text' => 'Llevar hidratación.'],
        ['text' => 'Usar casco y luces.'],
    ]);

    $route->observations()->createMany([
        ['text' => 'Tramo con viento lateral.'],
    ]);

    $poiCategory = PoiCategory::query()->where('name', 'Mirador')->firstOrFail();
    $poi = PointOfInterest::query()->create([
        'poi_category_id' => $poiCategory->id,
        'name' => 'Mirador de prueba',
        'description' => 'Mirador asociado a la ruta.',
        'address' => 'Mirador de Salinas',
        'phone' => '0990000000',
        'latitude' => -1.405,
        'longitude' => -79.021,
        'active' => true,
    ]);

    $route->pointsOfInterest()->attach($poi->id, [
        'sort_order' => 1,
        'is_required' => true,
        'distance_from_start_km' => 4.5,
        'route_observation' => 'Parada sugerida.',
    ]);

    $poi->images()->create([
        'image_path' => 'pois/mirador-prueba.jpg',
        'description' => 'Vista del mirador.',
        'sort_order' => 1,
    ]);

    $incidentType = IncidentType::query()->where('name', 'Obstáculo')->firstOrFail();
    $incidentStatus = IncidentStatus::query()->where('name', 'En revisión')->firstOrFail();

    $route->incidents()->create([
        'user_id' => $cyclist->id,
        'incident_type_id' => $incidentType->id,
        'incident_status_id' => $incidentStatus->id,
        'description' => 'Piedras pequeñas cerca del mirador.',
        'latitude' => -1.406,
        'longitude' => -79.022,
        'reported_at' => now(),
    ]);

    return $route;
}

test('cyclist can view active routes on map with geojson points and incidents', function () {
    $this->withoutVite();

    $cyclist = User::factory()->cyclist()->create();
    createRouteForMapVisualization();
    $queries = [];

    DB::listen(function (QueryExecuted $query) use (&$queries): void {
        $queries[] = $query->sql;
    });

    $this->actingAs($cyclist)
        ->get(route('routes.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('routes/index')
            ->has('routes.data', 1)
            ->where('routes.data.0.geojson.type', 'LineString')
            ->where('routes.data.0.points_of_interest.0.name', 'Mirador de prueba')
            ->where('routes.data.0.incidents.0.type.name', 'Obstáculo'));

    foreach (['geometrias_ruta', 'puntos_interes', 'incidencias'] as $table) {
        $query = collect($queries)->first(fn (string $sql): bool => str_contains($sql, "from \"{$table}\""));

        expect($query)
            ->not->toBeNull()
            ->not->toContain('"geom"');

        if ($table === 'geometrias_ruta') {
            expect($query)->not->toContain('select *');
        }
    }
});

test('cyclist map explorer only exposes active routes and its selected route', function () {
    $this->withoutVite();

    $cyclist = User::factory()->cyclist()->create();
    $activeRoute = createRouteForMapVisualization();
    $inactiveRoute = createRouteForMapVisualization('Inactiva');

    FavoriteRoute::query()->create([
        'user_id' => $cyclist->id,
        'route_id' => $activeRoute->id,
        'favorited_at' => now(),
    ]);

    $this->actingAs($cyclist)
        ->get(route('maps.index', ['route' => $activeRoute->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('maps/index')
            ->has('routes', 1)
            ->where('routes.0.slug', $activeRoute->slug)
            ->where('routes.0.geojson.type', 'LineString')
            ->where('routes.0.points_of_interest.0.name', 'Mirador de prueba')
            ->where('routes.0.points_of_interest.0.description', 'Mirador asociado a la ruta.')
            ->where('routes.0.points_of_interest.0.address', 'Mirador de Salinas')
            ->where('routes.0.points_of_interest.0.phone', '0990000000')
            ->where('routes.0.points_of_interest.0.images.0.image_path', 'pois/mirador-prueba.jpg')
            ->where('routes.0.incidents.0.type.name', 'Obstáculo')
            ->where('routes.0.is_favorite', true)
            ->has('incidentTypes', 6)
            ->where('incidentTypes.1.name', 'Obstáculo')
            ->where('selectedRouteSlug', $activeRoute->slug));

    $this->actingAs($cyclist)
        ->get(route('maps.index', ['route' => $inactiveRoute->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('maps/index')
            ->where('selectedRouteSlug', null));
});

test('cyclist can view route detail with metrics recommendations and map payload', function () {
    $this->withoutVite();

    $cyclist = User::factory()->cyclist()->create();
    $route = createRouteForMapVisualization();

    $this->actingAs($cyclist)
        ->get(route('routes.show', $route->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('routes/show')
            ->where('route.name', 'Ruta mapa Salinas')
            ->where('route.metric.distance_km', 9.75)
            ->where('route.recommendations.0', 'Llevar hidratación.')
            ->where('route.observations.0', 'Tramo con viento lateral.')
            ->where('route.points_of_interest.0.is_required', true)
            ->where('route.incidents.0.status.name', 'En revisión'));
});

test('inactive route detail is not available to cyclist', function () {
    $this->withoutVite();

    $cyclist = User::factory()->cyclist()->create();
    $route = createRouteForMapVisualization('Inactiva');

    $this->actingAs($cyclist)
        ->get(route('routes.show', $route->slug))
        ->assertNotFound();
});
