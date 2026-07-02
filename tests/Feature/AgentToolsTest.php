<?php

use App\Models\CyclingRoute;
use App\Models\IncidentStatus;
use App\Models\IncidentType;
use App\Models\ModerationStatus;
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
    $approvedStatus = ModerationStatus::query()->where('name', 'aprobado')->firstOrFail();
    $pendingStatus = ModerationStatus::query()->where('name', 'pendiente')->firstOrFail();

    $route = CyclingRoute::query()->create([
        'admin_user_id' => $admin->id,
        'route_difficulty_id' => $difficulty->id,
        'route_status_id' => $status->id,
        'route_category_id' => $category->id,
        'name' => "Ruta agente {$sequence}",
        'slug' => "ruta-agente-{$sequence}",
        'description' => 'Ruta para validar tools del agente con métricas, POIs, alertas y valoraciones.',
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
        'observations' => 'Solo acepta efectivo después de las 18:00.',
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

    $route->ratings()->create([
        'user_id' => $cyclist->id,
        'moderation_status_id' => $approvedStatus->id,
        'rating' => 5,
        'comment' => 'Excelente ruta, muy bien señalizada.',
        'rated_at' => now(),
    ]);

    $otherCyclist = User::factory()->cyclist()->create();

    $route->ratings()->create([
        'user_id' => $otherCyclist->id,
        'moderation_status_id' => $pendingStatus->id,
        'rating' => 1,
        'comment' => 'Valoración pendiente que no debe exponerse.',
        'rated_at' => now(),
    ]);

    return [$route, $poi];
}

function agentHeaders(string $token = 'agent-secret'): array
{
    return ['Authorization' => 'Bearer '.$token];
}

test('agent tools require valid token', function () {
    $this->postJson(route('agent.routes'))
        ->assertUnauthorized();

    $this->postJson(route('agent.routes'), [], agentHeaders('wrong-token'))
        ->assertUnauthorized();
});

test('agent routes tool returns full details for recommendations without duplicated fields', function () {
    [$route, $poi] = createRouteForAgentTools();
    createRouteForAgentTools('inactiva');

    $response = $this->postJson(route('agent.routes'), [
        'intent' => 'recommend',
        'location' => [
            'latitude' => -1.401,
            'longitude' => -79.017,
        ],
        'max_results' => 5,
    ], agentHeaders())
        ->assertOk()
        ->assertJsonPath('mode', 'recommend')
        ->assertJsonPath('selected_route', null)
        ->assertJsonPath('routes.0.id', $route->id)
        ->assertJsonPath('routes.0.name', $route->name)
        ->assertJsonPath('routes.0.observations.0', 'Tramo con viento lateral.')
        ->assertJsonPath('routes.0.recommendations.0', 'Llevar hidratación.')
        ->assertJsonPath('routes.0.rating.average', 5)
        ->assertJsonPath('routes.0.rating.total', 1)
        ->assertJsonPath('routes.0.reviews.0.comment', 'Excelente ruta, muy bien señalizada.')
        ->assertJsonPath('routes.0.pois.0.id', $poi->id)
        ->assertJsonPath('routes.0.pois.0.observations', 'Solo acepta efectivo después de las 18:00.')
        ->assertJsonPath('routes.0.pois.0.distance_from_user_km', fn ($value) => $value !== null)
        ->assertJsonPath('routes.0.alerts.0.title', 'Piedras en la vía')
        ->assertJsonPath('routes.0.metric.distance_km', 9.75)
        ->assertJsonPath('summary.has_location', true)
        ->assertJsonPath('summary.sorted_by', 'distance')
        ->assertJsonMissing(['name' => 'Ruta agente 2'])
        ->assertJsonMissing(['title' => 'Alerta no visible'])
        ->assertJsonMissing(['comment' => 'Valoración pendiente que no debe exponerse.']);

    $response->assertJsonMissingPath('routes.0.geojson');
    $response->assertJsonMissingPath('routes.0.image_url');
    $response->assertJsonMissingPath('routes.0.href');
    $response->assertJsonMissingPath('routes.0.type');
    $response->assertJsonMissingPath('routes.0.route');
});

test('agent routes tool falls back to available routes when generic query has no matches', function () {
    [$route] = createRouteForAgentTools();
    createRouteForAgentTools('inactiva');

    $this->postJson(route('agent.routes'), [
        'query' => '¿Qué ruta me recomiendas para este fin de semana?',
        'max_results' => 5,
    ], agentHeaders())
        ->assertOk()
        ->assertJsonPath('routes.0.id', $route->id)
        ->assertJsonPath('routes.0.distance_from_user_km', null)
        ->assertJsonMissing(['name' => 'Ruta agente 2']);
});

test('agent routes tool returns selected route detail with pois, alerts and ratings', function () {
    [$route, $poi] = createRouteForAgentTools();

    $this->postJson(route('agent.routes'), [
        'intent' => 'detail',
        'route_slug' => $route->slug,
    ], agentHeaders())
        ->assertOk()
        ->assertJsonPath('mode', 'detail')
        ->assertJsonPath('selected_route.id', $route->id)
        ->assertJsonPath('selected_route.pois.0.id', $poi->id)
        ->assertJsonPath('selected_route.pois.0.details.store.sells_hydration', true)
        ->assertJsonPath('selected_route.pois.0.route_context.distance_from_start_km', 4.5)
        ->assertJsonPath('selected_route.alerts.0.title', 'Piedras en la vía')
        ->assertJsonMissing(['title' => 'Alerta no visible'])
        ->assertJsonPath('selected_route.recommendations.0', 'Llevar hidratación.')
        ->assertJsonPath('selected_route.observations.0', 'Tramo con viento lateral.')
        ->assertJsonPath('selected_route.rating.total', 1)
        ->assertJsonPath('routes', [])
        ->assertJsonPath('summary.sorted_by', 'selected_route');
});

test('agent routes tool searches pois independently and hides inactive pois', function () {
    [$route, $poi] = createRouteForAgentTools();
    createRouteForAgentTools('activa', false);

    $this->postJson(route('agent.routes'), [
        'intent' => 'pois',
        'location' => [
            'latitude' => -1.4051,
            'longitude' => -79.0211,
        ],
        'route_id' => $route->id,
        'poi_category' => 'tienda',
        'max_results' => 5,
    ], agentHeaders())
        ->assertOk()
        ->assertJsonPath('mode', 'pois')
        ->assertJsonPath('pois.0.id', $poi->id)
        ->assertJsonPath('pois.0.observations', 'Solo acepta efectivo después de las 18:00.')
        ->assertJsonPath('pois.0.details.store.sells_hydration', true)
        ->assertJsonPath('pois.0.route_context.distance_from_start_km', 4.5)
        ->assertJsonPath('summary.total', 1)
        ->assertJsonPath('summary.has_location', true)
        ->assertJsonMissing(['name' => 'Tienda agente '.((int) substr($poi->name, -1) + 1)]);
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
