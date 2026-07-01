<?php

use App\Models\CyclingRoute;
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

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
    config(['guaranda.agent.tool_token' => 'agent-secret']);
});

function createRouteForAgentTools(string $statusName = 'activa', bool $poiActive = true): array
{
    static $sequence = 0;

    $sequence++;
    $admin = User::factory()->administrator()->create();
    $cyclist = User::factory()->cyclist()->create();
    $status = RouteStatus::query()->where('name', $statusName)->firstOrFail();
    $category = RouteCategory::query()->where('name', 'turística')->firstOrFail();
    $difficulty = RouteDifficulty::query()->where('name', 'media')->firstOrFail();
    $transportMode = TransportMode::query()->where('name', 'bicicleta')->firstOrFail();

    $route = CyclingRoute::query()->create([
        'admin_user_id' => $admin->id,
        'route_difficulty_id' => $difficulty->id,
        'route_status_id' => $status->id,
        'route_category_id' => $category->id,
        'name' => "Ruta agente {$sequence}",
        'slug' => "ruta-agente-{$sequence}",
        'description' => 'Ruta para validar tools del agente con métricas, POIs y alertas visibles.',
        'start_name' => 'Inicio agente',
        'start_latitude' => -1.4,
        'start_longitude' => -79.016,
        'end_name' => 'Final agente',
        'end_latitude' => -1.41,
        'end_longitude' => -79.026,
        'road_type' => 'Asfalto y lastre',
        'required_experience' => 'Experiencia media.',
        'main_image_path' => 'routes/agente.jpg',
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

    $route->recommendations()->create(['text' => 'Llevar hidratación.']);
    $route->observations()->create(['text' => 'Tramo con viento lateral.']);

    $poiCategory = PoiCategory::query()->where('name', 'tienda')->firstOrFail();
    $poi = PointOfInterest::query()->create([
        'poi_category_id' => $poiCategory->id,
        'name' => "Tienda agente {$sequence}",
        'description' => 'Tienda con hidratación para ciclistas.',
        'latitude' => -1.405,
        'longitude' => -79.021,
        'address' => 'Km 4',
        'phone' => '0988888888',
        'active' => $poiActive,
    ]);

    $poi->hours()->create([
        'weekday' => 1,
        'opens_at' => '08:00',
        'closes_at' => '18:00',
        'description' => 'Lunes',
    ]);

    $poi->storeDetail()->create([
        'sells_hydration' => true,
        'sells_snacks' => true,
        'accepted_payment_type' => 'efectivo',
    ]);

    $route->pointsOfInterest()->attach($poi->id, [
        'sort_order' => 1,
        'is_required' => true,
        'distance_from_start_km' => 4.5,
        'route_observation' => 'Parada recomendada.',
    ]);

    $incidentType = IncidentType::query()->where('name', 'obstáculo')->firstOrFail();
    $visibleStatus = IncidentStatus::query()->where('name', 'en revisión')->firstOrFail();
    $hiddenStatus = IncidentStatus::query()->where('name', 'reportada')->firstOrFail();

    $route->incidents()->create([
        'user_id' => $cyclist->id,
        'incident_type_id' => $incidentType->id,
        'incident_status_id' => $visibleStatus->id,
        'title' => 'Piedras en la vía',
        'description' => 'Piedras pequeñas cerca del punto medio.',
        'latitude' => -1.406,
        'longitude' => -79.022,
        'reported_at' => now(),
    ]);

    $route->incidents()->create([
        'user_id' => $cyclist->id,
        'incident_type_id' => $incidentType->id,
        'incident_status_id' => $hiddenStatus->id,
        'title' => 'Alerta no visible',
        'description' => 'No debe exponerse a n8n.',
        'latitude' => -1.407,
        'longitude' => -79.023,
        'reported_at' => now(),
    ]);

    return [$route, $poi];
}

function agentHeaders(string $token = 'agent-secret'): array
{
    return ['Authorization' => 'Bearer '.$token];
}

test('agent tools require valid token', function () {
    $this->postJson(route('agent.routes.search'))
        ->assertUnauthorized();

    $this->postJson(route('agent.routes.search'), [], agentHeaders('wrong-token'))
        ->assertUnauthorized();
});

test('agent can search active routes near a location', function () {
    [$route] = createRouteForAgentTools();
    createRouteForAgentTools('inactiva');

    $this->postJson(route('agent.routes.search'), [
        'latitude' => -1.401,
        'longitude' => -79.017,
        'max_results' => 5,
    ], agentHeaders())
        ->assertOk()
        ->assertJsonPath('routes.0.id', $route->id)
        ->assertJsonPath('routes.0.type', 'route')
        ->assertJsonPath('routes.0.title', $route->name)
        ->assertJsonMissing(['title' => 'Ruta agente 2'])
        ->assertJsonStructure([
            'routes' => [[
                'id',
                'title',
                'href',
                'meta',
                'distance_from_user_km',
                'route' => ['slug', 'start', 'end', 'metric'],
            ]],
        ]);
});

test('agent can get route detail with pois and visible alerts only', function () {
    [$route, $poi] = createRouteForAgentTools();

    $this->getJson(route('agent.routes.show', $route->slug), agentHeaders())
        ->assertOk()
        ->assertJsonPath('route.id', $route->id)
        ->assertJsonPath('route.pois.0.title', $poi->name)
        ->assertJsonPath('route.alerts.0.title', 'Piedras en la vía')
        ->assertJsonMissing(['title' => 'Alerta no visible'])
        ->assertJsonPath('route.recommendations.0', 'Llevar hidratación.')
        ->assertJsonPath('route.observations.0', 'Tramo con viento lateral.');
});

test('agent can search active pois near a location and hide inactive pois', function () {
    [$route, $poi] = createRouteForAgentTools();
    createRouteForAgentTools('activa', false);

    $this->postJson(route('agent.pois.search'), [
        'latitude' => -1.4051,
        'longitude' => -79.0211,
        'route_id' => $route->id,
        'category' => 'tienda',
        'max_results' => 5,
    ], agentHeaders())
        ->assertOk()
        ->assertJsonPath('pois.0.id', $poi->id)
        ->assertJsonPath('pois.0.type', 'poi')
        ->assertJsonPath('pois.0.details.store.sells_hydration', true)
        ->assertJsonPath('pois.0.route_context.distance_from_start_km', 4.5)
        ->assertJsonMissing(['title' => 'Tienda agente '.((int) substr($poi->name, -1) + 1)]);
});

test('agent can calculate progress on route geometry', function () {
    [$route] = createRouteForAgentTools();

    $this->postJson(route('agent.navigation.progress'), [
        'route_slug' => $route->slug,
        'latitude' => -1.405,
        'longitude' => -79.021,
    ], agentHeaders())
        ->assertOk()
        ->assertJsonPath('progress.route_id', $route->id)
        ->assertJsonPath('progress.route_slug', $route->slug)
        ->assertJson(fn ($json) => $json
            ->whereType('progress.progress_percentage', 'double|integer')
            ->whereType('progress.remaining_distance_km', 'double|integer')
            ->whereType('progress.nearest_point_distance_m', 'double|integer')
            ->etc());
});

test('agent can list visible route alerts only', function () {
    [$route, $poi] = createRouteForAgentTools();

    $this->getJson(route('agent.routes.alerts', $route->slug), agentHeaders())
        ->assertOk()
        ->assertJsonPath('alerts.0.title', 'Piedras en la vía')
        ->assertJsonMissing(['title' => 'Alerta no visible']);
});
