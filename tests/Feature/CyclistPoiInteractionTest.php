<?php

use App\Models\CyclingRoute;
use App\Models\PoiCategory;
use App\Models\PointOfInterest;
use App\Models\RouteCategory;
use App\Models\RouteDifficulty;
use App\Models\RouteStatus;
use App\Models\TransportMode;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

function createRouteWithPoiForCyclist(bool $poiActive = true): array
{
    $admin = User::factory()->administrator()->create();
    $status = RouteStatus::query()->where('name', 'activa')->firstOrFail();
    $category = RouteCategory::query()->where('name', 'turística')->firstOrFail();
    $difficulty = RouteDifficulty::query()->where('name', 'media')->firstOrFail();
    $transportMode = TransportMode::query()->where('name', 'bicicleta')->firstOrFail();

    $route = CyclingRoute::query()->create([
        'admin_user_id' => $admin->id,
        'route_difficulty_id' => $difficulty->id,
        'route_status_id' => $status->id,
        'route_category_id' => $category->id,
        'name' => 'Ruta con POI ciclista',
        'slug' => 'ruta-con-poi-ciclista',
        'description' => 'Ruta para validar POIs visibles a ciclistas.',
        'start_name' => 'Inicio',
        'start_latitude' => -1.4,
        'start_longitude' => -79.016,
        'end_name' => 'Final',
        'end_latitude' => -1.41,
        'end_longitude' => -79.026,
        'road_type' => 'Asfalto',
        'required_experience' => 'Básica.',
        'route_version' => 1,
    ]);

    $route->geometry()->create([
        'geojson' => [
            'type' => 'LineString',
            'coordinates' => [[-79.016, -1.4], [-79.026, -1.41]],
        ],
    ]);

    $route->metrics()->create([
        'route_version' => 1,
        'transport_mode_id' => $transportMode->id,
        'distance_km' => 8.5,
        'estimated_time_minutes' => 60,
        'positive_elevation_m' => 100,
        'negative_elevation_m' => 80,
        'calculated_at' => now(),
    ]);

    $poiCategory = PoiCategory::query()->where('name', 'mirador')->firstOrFail();
    $poi = PointOfInterest::query()->create([
        'poi_category_id' => $poiCategory->id,
        'name' => 'Mirador ciclista',
        'description' => 'Mirador activo para la ruta.',
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

    $route->pointsOfInterest()->attach($poi->id, [
        'sort_order' => 1,
        'is_required' => true,
        'distance_from_start_km' => 4.5,
        'route_observation' => 'Parada recomendada.',
    ]);

    return [$route, $poi];
}

test('cyclist can view active route pois and suggestion categories', function () {
    $this->withoutVite();

    $cyclist = User::factory()->cyclist()->create();
    [$route] = createRouteWithPoiForCyclist();

    $this->actingAs($cyclist)
        ->get(route('routes.show', $route->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('routes/show')
            ->where('route.points_of_interest.0.name', 'Mirador ciclista')
            ->where('route.points_of_interest.0.address', 'Km 4')
            ->where('route.points_of_interest.0.hours.0.opens_at', '08:00')
            ->has('poiCategories', 6));
});

test('cyclist can suggest a poi', function () {
    $cyclist = User::factory()->cyclist()->create();
    $category = PoiCategory::query()->where('name', 'tienda')->firstOrFail();

    $this->actingAs($cyclist)
        ->post(route('pois.suggestions.store'), [
            'poi_category_id' => $category->id,
            'name' => 'Tienda sugerida',
            'description' => 'Tiene hidratación y snacks.',
            'latitude' => -1.404,
            'longitude' => -79.022,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $this->assertDatabaseHas('sugerencias_punto_interes', [
        'user_id' => $cyclist->id,
        'poi_category_id' => $category->id,
        'name' => 'Tienda sugerida',
        'status' => 'pendiente',
    ]);
});

test('cyclist can report an active poi', function () {
    $cyclist = User::factory()->cyclist()->create();
    [, $poi] = createRouteWithPoiForCyclist();

    $this->actingAs($cyclist)
        ->post(route('pois.reports.store', $poi), [
            'report_type' => 'datos incorrectos',
            'description' => 'El teléfono ya no responde.',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $this->assertDatabaseHas('reportes_punto_interes', [
        'user_id' => $cyclist->id,
        'point_of_interest_id' => $poi->id,
        'report_type' => 'datos incorrectos',
        'status' => 'pendiente',
    ]);
});

test('inactive poi is hidden from route detail and can not be reported', function () {
    $this->withoutVite();

    $cyclist = User::factory()->cyclist()->create();
    [$route, $poi] = createRouteWithPoiForCyclist(false);

    $this->actingAs($cyclist)
        ->get(route('routes.show', $route->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('routes/show')
            ->has('route.points_of_interest', 0));

    $this->actingAs($cyclist)
        ->post(route('pois.reports.store', $poi), [
            'report_type' => 'cerrado',
            'description' => 'Está cerrado.',
        ])
        ->assertForbidden();
});
