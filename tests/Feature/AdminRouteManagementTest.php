<?php

use App\Models\CyclingRoute;
use App\Models\RouteCategory;
use App\Models\RouteDifficulty;
use App\Models\RouteStatus;
use App\Models\RoutingEngine;
use App\Models\TransportMode;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

function routePayload(array $overrides = []): array
{
    $status = RouteStatus::query()->where('name', 'activa')->firstOrFail();
    $category = RouteCategory::query()->where('name', 'MTB')->firstOrFail();
    $difficulty = RouteDifficulty::query()->where('name', 'media')->firstOrFail();
    $transportMode = TransportMode::query()->where('name', 'bicicleta')->firstOrFail();
    $routingEngine = RoutingEngine::query()->where('name', 'OSRM')->firstOrFail();

    return [
        'route_status_id' => $status->id,
        'route_category_id' => $category->id,
        'route_difficulty_id' => $difficulty->id,
        'name' => 'Ruta Salinas de Bolívar',
        'description' => 'Ruta turística para conectar atractivos rurales y miradores cercanos a Salinas.',
        'start_name' => 'Parque central de Salinas',
        'start_latitude' => -1.4000000,
        'start_longitude' => -79.0160000,
        'end_name' => 'Mirador comunitario',
        'end_latitude' => -1.4100000,
        'end_longitude' => -79.0260000,
        'road_type' => 'Lastre y asfalto',
        'required_experience' => 'Recomendado para ciclistas con experiencia media y bicicleta en buen estado.',
        'main_image_path' => 'routes/salinas-principal.jpg',
        'geojson' => json_encode([
            'type' => 'LineString',
            'coordinates' => [
                [-79.0160000, -1.4000000],
                [-79.0200000, -1.4050000],
                [-79.0260000, -1.4100000],
            ],
        ], JSON_THROW_ON_ERROR),
        'transport_mode_id' => $transportMode->id,
        'routing_engine_id' => $routingEngine->id,
        'distance_km' => 12.345,
        'estimated_time_minutes' => 95,
        'positive_elevation_m' => 430.50,
        'negative_elevation_m' => 210.25,
        'recommendations_text' => "Llevar hidratación\nRevisar frenos antes de iniciar",
        'observations_text' => "Tramo con neblina frecuente\nEvitar lluvia intensa",
        'additional_images_text' => "routes/salinas-mirador.jpg|Mirador principal\nroutes/salinas-descanso.jpg|Punto de descanso",
        ...$overrides,
    ];
}

test('administrator can view route management pages', function () {
    $this->withoutVite();

    $admin = User::factory()->administrator()->create();

    $this->actingAs($admin)
        ->get(route('admin.routes.index'))
        ->assertOk();

    $this->actingAs($admin)
        ->get(route('admin.routes.create'))
        ->assertOk();
});

test('cyclist can not access route administration', function () {
    $cyclist = User::factory()->cyclist()->create();

    $this->actingAs($cyclist)
        ->get(route('admin.routes.index'))
        ->assertForbidden();

    $this->actingAs($cyclist)
        ->post(route('admin.routes.store'), routePayload())
        ->assertForbidden();
});

test('administrator can create a complete route', function () {
    $admin = User::factory()->administrator()->create();

    $this->actingAs($admin)
        ->post(route('admin.routes.store'), routePayload())
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.routes.index'));

    $route = CyclingRoute::query()->where('name', 'Ruta Salinas de Bolívar')->firstOrFail();

    expect($route->admin_user_id)->toBe($admin->id)
        ->and($route->slug)->toBe('ruta-salinas-de-bolivar')
        ->and($route->route_version)->toBe(1)
        ->and($route->geometry()->exists())->toBeTrue()
        ->and($route->metrics()->count())->toBe(1)
        ->and($route->recommendations()->count())->toBe(2)
        ->and($route->observations()->count())->toBe(2)
        ->and($route->images()->count())->toBe(3);
});

test('administrator can upload route cover and gallery images', function () {
    Storage::fake('public');

    $admin = User::factory()->administrator()->create();

    $this->actingAs($admin)
        ->post(route('admin.routes.store'), routePayload([
            'main_image_path' => null,
            'main_image' => UploadedFile::fake()->image('salinas-cover.jpg'),
            'additional_images_text' => '',
            'additional_images' => [
                UploadedFile::fake()->image('mirador.jpg'),
                UploadedFile::fake()->image('descanso.jpg'),
            ],
        ]))
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.routes.index'));

    $route = CyclingRoute::query()->where('name', 'Ruta Salinas de Bolívar')->firstOrFail();

    expect($route->main_image_path)->toStartWith('routes/')
        ->and($route->images()->count())->toBe(3)
        ->and($route->images()->where('is_main', true)->count())->toBe(1);

    Storage::disk('public')->assertExists($route->main_image_path);
});

test('administrator can update a route and increment its version', function () {
    $admin = User::factory()->administrator()->create();

    $this->actingAs($admin)
        ->post(route('admin.routes.store'), routePayload())
        ->assertSessionHasNoErrors();

    $route = CyclingRoute::query()->where('name', 'Ruta Salinas de Bolívar')->firstOrFail();

    $this->actingAs($admin)
        ->patch(route('admin.routes.update', $route), routePayload([
            'name' => 'Ruta Salinas actualizada',
            'distance_km' => 13.5,
            'recommendations_text' => "Llevar hidratación\nUsar luces delanteras",
        ]))
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.routes.index'));

    $route->refresh();

    expect($route->name)->toBe('Ruta Salinas actualizada')
        ->and($route->route_version)->toBe(2)
        ->and($route->metrics()->where('route_version', 2)->exists())->toBeTrue()
        ->and($route->recommendations()->pluck('text')->all())->toContain('Usar luces delanteras');
});

test('administrator can inactivate a route without physical deletion', function () {
    $admin = User::factory()->administrator()->create();

    $this->actingAs($admin)
        ->post(route('admin.routes.store'), routePayload())
        ->assertSessionHasNoErrors();

    $route = CyclingRoute::query()->where('name', 'Ruta Salinas de Bolívar')->firstOrFail();

    $this->actingAs($admin)
        ->delete(route('admin.routes.destroy', $route))
        ->assertRedirect(route('admin.routes.index'));

    $route->refresh();

    expect($route->status?->name)->toBe('inactiva')
        ->and($route->route_version)->toBe(2)
        ->and(CyclingRoute::query()->whereKey($route->id)->exists())->toBeTrue();
});
