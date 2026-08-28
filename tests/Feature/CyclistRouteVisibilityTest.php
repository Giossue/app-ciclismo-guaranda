<?php

use App\Models\CyclingRoute;
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

function createCyclingRouteForVisibility(string $statusName, string $name): CyclingRoute
{
    $admin = User::factory()->administrator()->create();
    $status = RouteStatus::query()->where('name', $statusName)->firstOrFail();
    $category = RouteCategory::query()->where('name', 'Turística')->firstOrFail();
    $difficulty = RouteDifficulty::query()->where('name', 'Fácil')->firstOrFail();
    $transportMode = TransportMode::query()->where('name', 'Bicicleta')->firstOrFail();

    $route = CyclingRoute::query()->create([
        'admin_user_id' => $admin->id,
        'route_difficulty_id' => $difficulty->id,
        'route_status_id' => $status->id,
        'route_category_id' => $category->id,
        'name' => $name,
        'slug' => str($name)->slug()->toString(),
        'description' => 'Ruta preparada para validar visibilidad por estado.',
        'start_name' => 'Inicio turístico',
        'start_latitude' => -1.5,
        'start_longitude' => -79.0,
        'end_name' => 'Final turístico',
        'end_latitude' => -1.51,
        'end_longitude' => -79.01,
        'road_type' => 'Asfalto',
        'required_experience' => 'Apta para principiantes.',
        'main_image_path' => 'routes/activa.jpg',
        'route_version' => 1,
    ]);

    $route->geometry()->create([
        'geojson' => [
            'type' => 'LineString',
            'coordinates' => [[-79.0, -1.5], [-79.01, -1.51]],
        ],
    ]);

    $route->metrics()->create([
        'route_version' => 1,
        'transport_mode_id' => $transportMode->id,
        'distance_km' => 5.25,
        'estimated_time_minutes' => 45,
        'positive_elevation_m' => 80,
        'negative_elevation_m' => 40,
        'calculated_at' => now(),
    ]);

    return $route;
}

test('active route appears to cyclist', function () {
    $this->withoutVite();

    $cyclist = User::factory()->cyclist()->create();
    createCyclingRouteForVisibility('Activa', 'Ruta visible para ciclista');

    $this->actingAs($cyclist)
        ->get(route('routes.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('routes/index')
            ->has('routes.data', 1)
            ->where('routes.data.0.name', 'Ruta visible para ciclista'));
});

test('inactive and draft routes do not appear to cyclist', function () {
    $this->withoutVite();

    $cyclist = User::factory()->cyclist()->create();
    createCyclingRouteForVisibility('Inactiva', 'Ruta oculta inactiva');
    createCyclingRouteForVisibility('Borrador', 'Ruta oculta borrador');

    $this->actingAs($cyclist)
        ->get(route('routes.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('routes/index')
            ->has('routes.data', 0));
});

test('cyclist filters active routes by search, category and difficulty', function () {
    $this->withoutVite();

    $cyclist = User::factory()->cyclist()->create();
    $visible = createCyclingRouteForVisibility('Activa', 'Ruta del mirador');
    createCyclingRouteForVisibility('Activa', 'Ruta del mirador urbana')->update([
        'route_category_id' => RouteCategory::query()->where('name', 'Urbana')->firstOrFail()->id,
    ]);
    createCyclingRouteForVisibility('Activa', 'Ruta del mirador media')->update([
        'route_difficulty_id' => RouteDifficulty::query()->where('name', 'Media')->firstOrFail()->id,
    ]);
    createCyclingRouteForVisibility('Borrador', 'Ruta del mirador borrador');

    $this->actingAs($cyclist)
        ->get(route('routes.index', [
            'search' => 'mirador',
            'category' => $visible->route_category_id,
            'difficulty' => $visible->route_difficulty_id,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('routes/index')
            ->has('routes.data', 1)
            ->where('routes.data.0.id', $visible->id)
            ->where('filters.search', 'mirador')
            ->where('filters.category', (string) $visible->route_category_id)
            ->where('filters.difficulty', (string) $visible->route_difficulty_id));
});
