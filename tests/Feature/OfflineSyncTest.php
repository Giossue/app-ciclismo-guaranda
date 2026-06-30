<?php

use App\Models\CyclingRoute;
use App\Models\Incident;
use App\Models\IncidentStatus;
use App\Models\IncidentType;
use App\Models\PoiCategory;
use App\Models\PointOfInterest;
use App\Models\RouteCategory;
use App\Models\RouteDifficulty;
use App\Models\RouteDownload;
use App\Models\RouteStatus;
use App\Models\RoutingEngine;
use App\Models\SyncQueueEntry;
use App\Models\Track;
use App\Models\TransportMode;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

function createRouteForOfflineSync(float $distanceKm = 10.0): CyclingRoute
{
    static $sequence = 0;

    $sequence++;
    $admin = User::factory()->administrator()->create();
    $status = RouteStatus::query()->where('name', 'activa')->firstOrFail();
    $category = RouteCategory::query()->where('name', 'turística')->firstOrFail();
    $difficulty = RouteDifficulty::query()->where('name', 'media')->firstOrFail();
    $transportMode = TransportMode::query()->where('name', 'bicicleta')->firstOrFail();
    $routingEngine = RoutingEngine::query()->where('name', 'OSRM')->firstOrFail();

    /** @var CyclingRoute $route */
    $route = CyclingRoute::query()->create([
        'admin_user_id' => $admin->id,
        'route_difficulty_id' => $difficulty->id,
        'route_status_id' => $status->id,
        'route_category_id' => $category->id,
        'name' => "Ruta offline {$sequence}",
        'slug' => "ruta-offline-{$sequence}",
        'description' => 'Ruta para validar descarga y sincronización offline.',
        'start_name' => 'Inicio',
        'start_latitude' => 0,
        'start_longitude' => 0,
        'end_name' => 'Final',
        'end_latitude' => 0.09,
        'end_longitude' => 0,
        'road_type' => 'Asfalto',
        'required_experience' => 'Básica.',
        'route_version' => 1,
    ]);

    $route->geometry()->create([
        'geojson' => [
            'type' => 'LineString',
            'coordinates' => [[0, 0], [0, 0.09]],
        ],
    ]);

    $route->metrics()->create([
        'route_version' => 1,
        'transport_mode_id' => $transportMode->id,
        'routing_engine_id' => $routingEngine->id,
        'distance_km' => $distanceKm,
        'estimated_time_minutes' => 60,
        'positive_elevation_m' => 120,
        'negative_elevation_m' => 80,
        'calculated_at' => now(),
    ]);

    $route->recommendations()->create(['text' => 'Llevar hidratación.']);
    $route->observations()->create(['text' => 'Descenso con curvas.']);

    return $route;
}

test('cyclist can fetch a complete offline package for an active route', function () {
    $cyclist = User::factory()->cyclist()->create();
    $route = createRouteForOfflineSync();
    $poiCategory = PoiCategory::query()->where('name', 'mirador')->firstOrFail();
    $incidentType = IncidentType::query()->where('name', 'obstáculo')->firstOrFail();
    $incidentStatus = IncidentStatus::query()->where('name', 'en revisión')->firstOrFail();

    /** @var PointOfInterest $poi */
    $poi = PointOfInterest::query()->create([
        'poi_category_id' => $poiCategory->id,
        'name' => 'Mirador offline',
        'description' => 'Vista panorámica.',
        'latitude' => 0.02,
        'longitude' => 0,
        'active' => true,
    ]);

    $poi->images()->create([
        'image_path' => 'pois/mirador.jpg',
        'description' => 'Foto del mirador.',
        'sort_order' => 1,
    ]);

    $route->pointsOfInterest()->attach($poi->id, [
        'sort_order' => 1,
        'is_required' => true,
        'distance_from_start_km' => 2,
        'route_observation' => 'Parada recomendada.',
    ]);

    $route->incidents()->create([
        'user_id' => $cyclist->id,
        'incident_type_id' => $incidentType->id,
        'incident_status_id' => $incidentStatus->id,
        'title' => 'Rama en vía',
        'description' => 'Obstáculo visible antes del mirador.',
        'latitude' => 0.03,
        'longitude' => 0,
        'reported_at' => now(),
    ]);

    $this->actingAs($cyclist)
        ->getJson(route('routes.offline-package.show', $route->slug))
        ->assertOk()
        ->assertJsonPath('route.id', $route->id)
        ->assertJsonPath('route.route_version', 1)
        ->assertJsonPath('route.geojson.type', 'LineString')
        ->assertJsonPath('route.points_of_interest.0.name', 'Mirador offline')
        ->assertJsonPath('route.points_of_interest.0.images.0.image_path', 'pois/mirador.jpg')
        ->assertJsonPath('route.incidents.0.title', 'Rama en vía')
        ->assertJsonPath('map.status', 'pendiente');
});

test('cyclist can register a route download and detect outdated packages', function () {
    $cyclist = User::factory()->cyclist()->create();
    $route = createRouteForOfflineSync();

    $this->actingAs($cyclist)
        ->postJson(route('routes.downloads.store', $route->slug), [
            'download_status' => 'completada',
            'size_mb' => 1.25,
        ])
        ->assertOk()
        ->assertJsonPath('download.route_version', 1)
        ->assertJsonPath('download.is_outdated', false);

    $this->assertDatabaseHas('descargas_ruta', [
        'user_id' => $cyclist->id,
        'route_id' => $route->id,
        'download_status' => 'completada',
    ]);

    $route->forceFill(['route_version' => 2])->save();

    $this->actingAs($cyclist)
        ->getJson(route('routes.offline-package.show', $route->slug))
        ->assertOk()
        ->assertJsonPath('download.route_version', 1)
        ->assertJsonPath('download.current_route_version', 2)
        ->assertJsonPath('download.is_outdated', true);
});

test('cyclist can sync an offline incident with a photo', function () {
    Storage::fake('public');

    $cyclist = User::factory()->cyclist()->create();
    $route = createRouteForOfflineSync();
    $type = IncidentType::query()->where('name', 'derrumbe')->firstOrFail();

    $this->actingAs($cyclist)
        ->postJson(route('sync.offline-events.store'), [
            'events' => [[
                'client_id' => 'offline-incident-1',
                'event_type' => 'offline_incident_reported',
                'payload' => [
                    'route_id' => $route->id,
                    'incident_type_id' => $type->id,
                    'title' => 'Derrumbe offline',
                    'description' => 'Reporte guardado sin conexión.',
                    'latitude' => 0.04,
                    'longitude' => 0,
                    'reported_at' => now()->toISOString(),
                    'photo_base64' => base64_encode('offline-image'),
                    'photo_name' => 'derrumbe.jpg',
                ],
            ]],
        ])
        ->assertOk()
        ->assertJsonPath('results.0.client_id', 'offline-incident-1')
        ->assertJsonPath('results.0.status', 'enviado');

    $incident = Incident::query()->where('title', 'Derrumbe offline')->firstOrFail();

    expect($incident->status?->name)->toBe('reportada')
        ->and($incident->files()->count())->toBe(1);

    Storage::disk('public')->assertExists($incident->files()->firstOrFail()->file_path);

    $this->assertDatabaseHas('entradas_cola_sincronizacion', [
        'user_id' => $cyclist->id,
        'event_type' => 'offline_incident_reported',
        'status' => 'enviado',
    ]);
});

test('cyclist can sync a completed offline track', function () {
    $cyclist = User::factory()->cyclist()->create();
    $route = createRouteForOfflineSync(distanceKm: 10.0);
    $startedAt = now()->subHour();

    $this->actingAs($cyclist)
        ->postJson(route('sync.offline-events.store'), [
            'events' => [[
                'client_id' => 'offline-track-1',
                'event_type' => 'offline_track_completed',
                'payload' => [
                    'route_id' => $route->id,
                    'started_at' => $startedAt->toISOString(),
                    'ended_at' => $startedAt->copy()->addHour()->toISOString(),
                    'points' => [
                        [
                            'latitude' => 0,
                            'longitude' => 0,
                            'elevation_m' => 100,
                            'recorded_at' => $startedAt->toISOString(),
                        ],
                        [
                            'latitude' => 0.09,
                            'longitude' => 0,
                            'elevation_m' => 130,
                            'recorded_at' => $startedAt->copy()->addHour()->toISOString(),
                        ],
                    ],
                ],
            ]],
        ])
        ->assertOk()
        ->assertJsonPath('results.0.client_id', 'offline-track-1')
        ->assertJsonPath('results.0.status', 'enviado');

    $track = Track::query()->where('user_id', $cyclist->id)->where('route_id', $route->id)->firstOrFail();

    expect($track->status?->name)->toBe('finalizado')
        ->and($track->gpsPoints()->count())->toBe(2)
        ->and((float) $track->completion_percentage)->toBeGreaterThan(90.0)
        ->and($track->is_valid)->toBeTrue()
        ->and($track->summary['synced_from_offline'])->toBeTrue();
});

test('offline sync payload requires valid event fields', function () {
    $cyclist = User::factory()->cyclist()->create();

    $response = $this->actingAs($cyclist)
        ->postJson(route('sync.offline-events.store'), [
            'events' => [[
                'client_id' => 'invalid-track',
                'event_type' => 'offline_track_completed',
                'payload' => [
                    'route_id' => 123,
                    'started_at' => now()->toISOString(),
                    'ended_at' => now()->addHour()->toISOString(),
                    'points' => [
                        ['latitude' => 0, 'longitude' => 0],
                    ],
                ],
            ]],
        ]);

    $errors = $response->json('errors');

    expect($response->getStatusCode())->toBe(422)
        ->and($errors['events.0.payload.points'][0] ?? null)->toBe('Un recorrido offline requiere al menos dos puntos GPS.');

    expect(RouteDownload::query()->count())->toBe(0)
        ->and(SyncQueueEntry::query()->count())->toBe(0);
});
