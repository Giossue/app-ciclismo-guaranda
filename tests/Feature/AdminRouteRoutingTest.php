<?php

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

test('administrator can generate a normalized bicycle route preview', function () {
    Http::fake([
        'http://osrm.test:5000/route/v1/driving/*' => Http::response([
            'code' => 'Ok',
            'routes' => [[
                'distance' => 2345.67,
                'duration' => 601,
                'geometry' => [
                    'coordinates' => [
                        [-79.016, -1.4],
                        [-79.02, -1.405],
                        [-79.026, -1.41],
                    ],
                ],
            ]],
        ]),
    ]);

    $admin = User::factory()->administrator()->create();

    $response = $this->actingAs($admin)
        ->withHeader('Accept', 'application/json')
        ->post(route('admin.routes.routing-preview'), [
            'waypoints' => [
                ['latitude' => -1.4, 'longitude' => -79.016],
                ['latitude' => -1.41, 'longitude' => -79.026],
            ],
        ])
        ->assertSuccessful()
        ->assertJson([
            'geojson' => [
                'type' => 'LineString',
                'coordinates' => [
                    [-79.016, -1.4],
                    [-79.02, -1.405],
                    [-79.026, -1.41],
                ],
            ],
            'distance_km' => 2.346,
            'estimated_time_minutes' => 11,
        ]);

    Http::assertSent(function (Request $request): bool {
        return str_starts_with($request->url(), 'http://osrm.test:5000/route/v1/driving/-79.016000,-1.400000;-79.026000,-1.410000')
            && $request['geometries'] === 'geojson'
            && $request['overview'] === 'full';
    });
});

test('cyclist can not generate a route preview', function () {
    $cyclist = User::factory()->cyclist()->create();

    $this->actingAs($cyclist)
        ->postJson(route('admin.routes.routing-preview'), [
            'waypoints' => [
                ['latitude' => -1.4, 'longitude' => -79.016],
                ['latitude' => -1.41, 'longitude' => -79.026],
            ],
        ])
        ->assertForbidden();
});

test('preview rejects invalid coordinates without calling OSRM', function () {
    $admin = User::factory()->administrator()->create();

    $response = $this->actingAs($admin)
        ->withHeader('Accept', 'application/json')
        ->post(route('admin.routes.routing-preview'), [
            'waypoints' => [
                ['latitude' => -91, 'longitude' => -79.016],
                ['latitude' => -1.41, 'longitude' => -79.026],
            ],
        ]);

    $response->assertUnprocessable();

    expect(Http::recorded())->toHaveCount(0);
});

test('preview reports a route that cannot be found without exposing OSRM details', function () {
    Http::fake([
        'http://osrm.test:5000/route/v1/driving/*' => Http::response([
            'code' => 'NoRoute',
            'message' => 'Impossible route between points',
        ], 400),
    ]);

    $admin = User::factory()->administrator()->create();

    $this->actingAs($admin)
        ->postJson(route('admin.routes.routing-preview'), [
            'waypoints' => [
                ['latitude' => -1.4, 'longitude' => -79.016],
                ['latitude' => -1.41, 'longitude' => -79.026],
            ],
        ])
        ->assertUnprocessable()
        ->assertJsonPath('message', 'No se encontró una ruta ciclable entre esos puntos. Ajusta el inicio, el final o dibuja el trayecto manualmente.');
});

test('preview degrades safely when OSRM is unavailable', function () {
    Http::fake([
        'http://osrm.test:5000/route/v1/driving/*' => Http::response([], 503),
    ]);

    $admin = User::factory()->administrator()->create();

    $this->actingAs($admin)
        ->postJson(route('admin.routes.routing-preview'), [
            'waypoints' => [
                ['latitude' => -1.4, 'longitude' => -79.016],
                ['latitude' => -1.41, 'longitude' => -79.026],
            ],
        ])
        ->assertServiceUnavailable()
        ->assertJsonPath('message', 'No se pudo generar el recorrido ahora. Puedes ajustar los puntos o dibujarlo manualmente.');
});
