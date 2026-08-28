<?php

use App\Models\CuisineType;
use App\Models\CyclingRoute;
use App\Models\FoodDetail;
use App\Models\PoiCategory;
use App\Models\PointOfInterest;
use App\Models\PoiReport;
use App\Models\PoiSuggestion;
use App\Models\PriceRange;
use App\Models\RouteCategory;
use App\Models\RouteDifficulty;
use App\Models\RouteStatus;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

function createRouteForPoiManagement(): CyclingRoute
{
    static $sequence = 0;

    $sequence++;
    $admin = User::factory()->administrator()->create();
    $status = RouteStatus::query()->where('name', 'Activa')->firstOrFail();
    $category = RouteCategory::query()->where('name', 'Turística')->firstOrFail();
    $difficulty = RouteDifficulty::query()->where('name', 'Media')->firstOrFail();

    return CyclingRoute::query()->create([
        'admin_user_id' => $admin->id,
        'route_difficulty_id' => $difficulty->id,
        'route_status_id' => $status->id,
        'route_category_id' => $category->id,
        'name' => 'Ruta POI admin',
        'slug' => "ruta-poi-admin-{$sequence}",
        'description' => 'Ruta para validar asociación con puntos de interés.',
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
}

function adminPoiPayload(array $overrides = []): array
{
    $category = PoiCategory::query()->where('name', 'Comida')->firstOrFail();
    $cuisineType = CuisineType::query()->where('name', 'Ecuatoriana')->firstOrFail();
    $priceRange = PriceRange::query()->where('name', 'Económico')->firstOrFail();
    $route = createRouteForPoiManagement();

    return [
        'poi_category_id' => $category->id,
        'name' => 'Cafetería de prueba',
        'description' => 'Parada con comida local para ciclistas.',
        'observations' => 'Tiene vista al valle.',
        'latitude' => -1.405,
        'longitude' => -79.021,
        'address' => 'Frente al parque central',
        'phone' => '0999999999',
        'active' => true,
        'route_links_text' => "{$route->id}|1|4.5|Parada obligatoria",
        'hours_text' => "1|08:00|18:00|Lunes\n2|08:00|18:00|Martes",
        'images_text' => 'pois/cafeteria.jpg|Fachada principal',
        'cuisine_type_id' => $cuisineType->id,
        'price_range_id' => $priceRange->id,
        'is_pet_friendly' => true,
        'has_wifi' => true,
        'accepted_payment_type' => 'efectivo y transferencia',
        'has_bike_parking' => true,
        'chef_recommendation' => 'Chocolate caliente con queso.',
        'menu_url' => 'https://example.com/menu',
        ...$overrides,
    ];
}

test('administrator can view poi management pages', function () {
    $this->withoutVite();

    $admin = User::factory()->administrator()->create();
    $category = PoiCategory::query()->where('name', 'Comida')->firstOrFail();
    $poi = PointOfInterest::query()->create([
        'poi_category_id' => $category->id,
        'name' => 'POI para editar en sheet',
        'latitude' => -1.405,
        'longitude' => -79.021,
        'active' => true,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.pois.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/pois/index')
            ->where('form', null)
            ->where('formOptions', null));

    $this->actingAs($admin)
        ->get(route('admin.pois.create'))
        ->assertRedirect(route('admin.pois.index', ['form' => 'create']));

    $this->actingAs($admin)
        ->get(route('admin.pois.index', ['form' => 'create']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/pois/index')
            ->where('form', 'create')
            ->has('formOptions.categories'));

    $this->actingAs($admin)
        ->get(route('admin.pois.edit', $poi))
        ->assertRedirect(route('admin.pois.index', [
            'form' => 'edit',
            'poi' => $poi->id,
        ]));

    $this->actingAs($admin)
        ->get(route('admin.pois.index', [
            'form' => 'edit',
            'poi' => $poi->id,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/pois/index')
            ->where('form', 'edit')
            ->where('poiForm.id', $poi->id)
            ->has('formOptions.categories'));

    $this->actingAs($admin)
        ->get(route('admin.pois.suggestions.index'))
        ->assertOk();

    $this->actingAs($admin)
        ->get(route('admin.pois.reports.index'))
        ->assertOk();
});

test('cyclist can not access poi administration', function () {
    $cyclist = User::factory()->cyclist()->create();
    $category = PoiCategory::query()->where('name', 'Comida')->firstOrFail();
    $poi = PointOfInterest::query()->create([
        'poi_category_id' => $category->id,
        'name' => 'POI no autorizado',
        'latitude' => -1.405,
        'longitude' => -79.021,
        'active' => true,
    ]);

    $this->actingAs($cyclist)
        ->get(route('admin.pois.index'))
        ->assertForbidden();

    $this->actingAs($cyclist)
        ->get(route('admin.pois.index', ['form' => 'create']))
        ->assertForbidden();

    $this->actingAs($cyclist)
        ->get(route('admin.pois.create'))
        ->assertForbidden();

    $this->actingAs($cyclist)
        ->get(route('admin.pois.index', [
            'form' => 'edit',
            'poi' => $poi->id,
        ]))
        ->assertForbidden();

    $this->actingAs($cyclist)
        ->get(route('admin.pois.edit', $poi))
        ->assertForbidden();

    $this->actingAs($cyclist)
        ->post(route('admin.pois.store'), adminPoiPayload())
        ->assertForbidden();

    $this->actingAs($cyclist)
        ->get(route('admin.pois.suggestions.index'))
        ->assertForbidden();

    $this->actingAs($cyclist)
        ->get(route('admin.pois.reports.index'))
        ->assertForbidden();
});

test('administrator can browse POIs, suggestions and reports in separate views', function () {
    $this->withoutVite();

    $admin = User::factory()->administrator()->create();
    $cyclist = User::factory()->cyclist()->create();
    $category = PoiCategory::query()->where('name', 'Comida')->firstOrFail();
    $poi = PointOfInterest::query()->create([
        'poi_category_id' => $category->id,
        'name' => 'POI para retroalimentación',
        'description' => 'POI usado para comprobar el submenú administrativo.',
        'latitude' => -1.405,
        'longitude' => -79.021,
        'active' => true,
    ]);

    PoiSuggestion::query()->create([
        'user_id' => $cyclist->id,
        'poi_category_id' => $category->id,
        'name' => 'Sugerencia separada',
        'description' => 'Debe aparecer solo en la vista de sugerencias.',
        'status' => 'Pendiente',
        'suggested_at' => now(),
    ]);

    PoiReport::query()->create([
        'user_id' => $cyclist->id,
        'point_of_interest_id' => $poi->id,
        'report_type' => 'Cerrado',
        'description' => 'Debe aparecer solo en la vista de reportes.',
        'status' => 'Pendiente',
        'reported_at' => now(),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.pois.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/pois/index')
            ->has('pois.data', 1)
            ->where('pois.data.0.name', 'POI para retroalimentación'));

    $this->actingAs($admin)
        ->get(route('admin.pois.suggestions.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/pois/suggestions/index')
            ->has('suggestions.data', 1)
            ->where('suggestions.data.0.name', 'Sugerencia separada'));

    $this->actingAs($admin)
        ->get(route('admin.pois.reports.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/pois/reports/index')
            ->has('reports.data', 1)
            ->where('reports.data.0.poi.name', 'POI para retroalimentación'));
});

test('administrator can create a complete poi with details and route association', function () {
    $admin = User::factory()->administrator()->create();
    $payload = adminPoiPayload();

    $this->actingAs($admin)
        ->post(route('admin.pois.store'), $payload)
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.pois.index'));

    $poi = PointOfInterest::query()->where('name', 'Cafetería de prueba')->firstOrFail();

    expect($poi->active)->toBeTrue()
        ->and($poi->routes()->count())->toBe(1)
        ->and($poi->hours()->count())->toBe(2)
        ->and($poi->images()->count())->toBe(1)
        ->and($poi->foodDetail()->exists())->toBeTrue();

    $this->assertDatabaseHas('ruta_punto_interes', [
        'point_of_interest_id' => $poi->id,
        'is_required' => true,
        'distance_from_start_km' => 4.5,
    ]);

    $this->assertDatabaseHas('detalles_comida', [
        'point_of_interest_id' => $poi->id,
        'has_wifi' => true,
        'has_bike_parking' => true,
    ]);
});

test('administrator can update poi and replace category details', function () {
    $admin = User::factory()->administrator()->create();

    $this->actingAs($admin)
        ->post(route('admin.pois.store'), adminPoiPayload())
        ->assertSessionHasNoErrors();

    $poi = PointOfInterest::query()->where('name', 'Cafetería de prueba')->firstOrFail();
    $miradorCategory = PoiCategory::query()->where('name', 'Mirador')->firstOrFail();

    $this->actingAs($admin)
        ->patch(route('admin.pois.update', $poi), adminPoiPayload([
            'poi_category_id' => $miradorCategory->id,
            'name' => 'Mirador actualizado',
            'description' => 'Mirador oficial actualizado.',
            'hours_text' => '7|06:00|17:00|Domingo',
            'images_text' => 'pois/mirador.jpg|Vista panorámica',
            'cuisine_type_id' => null,
            'price_range_id' => null,
        ]))
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.pois.index'));

    $poi->refresh();

    expect($poi->name)->toBe('Mirador actualizado')
        ->and($poi->category?->name)->toBe('Mirador')
        ->and($poi->hours()->count())->toBe(1)
        ->and(FoodDetail::query()->whereKey($poi->id)->exists())->toBeFalse();
});

test('administrator can disable poi with soft delete', function () {
    $admin = User::factory()->administrator()->create();

    $this->actingAs($admin)
        ->post(route('admin.pois.store'), adminPoiPayload())
        ->assertSessionHasNoErrors();

    $poi = PointOfInterest::query()->where('name', 'Cafetería de prueba')->firstOrFail();

    $this->actingAs($admin)
        ->delete(route('admin.pois.destroy', $poi))
        ->assertRedirect(route('admin.pois.index'));

    $poi = PointOfInterest::withTrashed()->findOrFail($poi->id);

    expect($poi->active)->toBeFalse()
        ->and($poi->trashed())->toBeTrue();
});

test('administrator can open a disabled POI in the edit sheet', function () {
    $this->withoutVite();

    $admin = User::factory()->administrator()->create();
    $category = PoiCategory::query()->where('name', 'Comida')->firstOrFail();
    $poi = PointOfInterest::query()->create([
        'poi_category_id' => $category->id,
        'name' => 'POI inactivo para editar',
        'latitude' => -1.405,
        'longitude' => -79.021,
        'active' => false,
    ]);
    $poi->delete();

    $this->actingAs($admin)
        ->get(route('admin.pois.edit', $poi))
        ->assertRedirect(route('admin.pois.index', [
            'form' => 'edit',
            'poi' => $poi->id,
        ]));

    $this->actingAs($admin)
        ->get(route('admin.pois.index', [
            'form' => 'edit',
            'poi' => $poi->id,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('poiForm.id', $poi->id)
            ->where('poiForm.active', false));
});
