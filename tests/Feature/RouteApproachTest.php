<?php

use App\Models\CyclingRoute;
use App\Models\RouteCategory;
use App\Models\RouteDifficulty;
use App\Models\RouteStatus;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
    config([
        'guaranda.routing.osrm.base_url' => 'http://osrm.test:5000',
        'guaranda.routing.osrm.timeout_seconds' => 5,
        'guaranda.routing.osrm.connect_timeout_seconds' => 1,
    ]);
    Http::preventStrayRequests();
});

function createRouteForApproach(): CyclingRoute
{
    $admin = User::factory()->administrator()->create();
    $status = RouteStatus::query()->where('name', 'Activa')->firstOrFail();
    $category = RouteCategory::query()->where('name', 'Turística')->firstOrFail();
    $difficulty = RouteDifficulty::query()->where('name', 'Media')->firstOrFail();

    /** @var CyclingRoute $route */
    $route = CyclingRoute::query()->create([
        'admin_user_id' => $admin->id,
        'route_difficulty_id' => $difficulty->id,
        'route_status_id' => $status->id,
        'route_category_id' => $category->id,
        'name' => 'Ruta para aproximación',
        'slug' => 'ruta-para-aproximacion',
        'description' => 'Ruta para validar el camino al punto de partida.',
        'start_name' => 'Inicio',
        'start_latitude' => -1.61,
        'start_longitude' => -79.01,
        'end_name' => 'Final',
        'end_latitude' => -1.7,
        'end_longitude' => -79.05,
        'road_type' => 'Asfalto',
        'required_experience' => 'Básica.',
        'route_version' => 1,
    ]);

    return $route;
}

test('cyclist gets an OSRM approach path with turn-by-turn steps', function () {
    Http::fake([
        'http://osrm.test:5000/route/v1/driving/*' => Http::response([
            'code' => 'Ok',
            'routes' => [[
                'distance' => 1500.4,
                'duration' => 420,
                'geometry' => [
                    'coordinates' => [
                        [-79.0, -1.6],
                        [-79.005, -1.605],
                        [-79.01, -1.61],
                    ],
                ],
                'legs' => [[
                    'steps' => [
                        [
                            'distance' => 900.25,
                            'name' => 'García Moreno',
                            'maneuver' => [
                                'type' => 'depart',
                                'location' => [-79.0, -1.6],
                            ],
                            'geometry' => [
                                'coordinates' => [
                                    [-79.0, -1.6],
                                    [-79.005, -1.605],
                                ],
                            ],
                        ],
                        [
                            'distance' => 600.15,
                            'name' => 'Calle 14',
                            'maneuver' => [
                                'type' => 'turn',
                                'modifier' => 'left',
                                'location' => [-79.005, -1.605],
                            ],
                            'geometry' => [
                                'coordinates' => [
                                    [-79.005, -1.605],
                                    [-79.01, -1.61],
                                ],
                            ],
                        ],
                    ],
                ]],
            ]],
        ]),
    ]);

    $cyclist = User::factory()->cyclist()->create();
    $route = createRouteForApproach();

    $this->actingAs($cyclist)
        ->getJson(route('routes.approach.show', [
            'route' => $route,
            'latitude' => -1.6,
            'longitude' => -79.0,
        ]))
        ->assertSuccessful()
        ->assertJson([
            'geojson' => [
                'type' => 'LineString',
                'coordinates' => [
                    [-79.0, -1.6],
                    [-79.005, -1.605],
                    [-79.01, -1.61],
                ],
            ],
            'distance_km' => 1.5,
            'estimated_time_minutes' => 7,
            'steps' => [
                [
                    'distance_m' => 900.3,
                    'name' => 'García Moreno',
                    'maneuver' => [
                        'type' => 'depart',
                        'modifier' => null,
                        'exit' => null,
                        'location' => [-79.0, -1.6],
                    ],
                ],
                [
                    'distance_m' => 600.2,
                    'name' => 'Calle 14',
                    'maneuver' => [
                        'type' => 'turn',
                        'modifier' => 'left',
                        'exit' => null,
                        'location' => [-79.005, -1.605],
                    ],
                ],
            ],
        ]);

    Http::assertSent(function (Request $request): bool {
        return str_starts_with($request->url(), 'http://osrm.test:5000/route/v1/driving/-79.000000,-1.600000;-79.010000,-1.610000')
            && $request['geometries'] === 'geojson'
            && $request['steps'] === 'true';
    });
});

test('approach rejects invalid coordinates without calling OSRM', function () {
    $cyclist = User::factory()->cyclist()->create();
    $route = createRouteForApproach();

    $this->actingAs($cyclist)
        ->getJson(route('routes.approach.show', [
            'route' => $route,
            'latitude' => 200,
            'longitude' => -79.0,
        ]))
        ->assertUnprocessable();

    Http::assertNothingSent();
});

test('approach reports when OSRM finds no path', function () {
    Http::fake([
        'http://osrm.test:5000/route/v1/driving/*' => Http::response([
            'code' => 'NoRoute',
        ], 400),
    ]);

    $cyclist = User::factory()->cyclist()->create();
    $route = createRouteForApproach();

    $this->actingAs($cyclist)
        ->getJson(route('routes.approach.show', [
            'route' => $route,
            'latitude' => -1.6,
            'longitude' => -79.0,
        ]))
        ->assertUnprocessable()
        ->assertJsonPath('message', 'No encontramos un camino hasta el inicio de esta ruta.');
});

test('guests can not request an approach path', function () {
    $route = createRouteForApproach();

    $this->get(route('routes.approach.show', [
        'route' => $route,
        'latitude' => -1.6,
        'longitude' => -79.0,
    ]))->assertRedirect(route('login'));
});
