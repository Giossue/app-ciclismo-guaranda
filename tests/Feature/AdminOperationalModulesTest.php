<?php

use App\Models\RouteCategory;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('administrator can access operational admin modules', function (string $routeName, string $component) {
    $this->withoutVite();

    $admin = User::factory()->administrator()->create();

    $this->actingAs($admin)
        ->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    'catalogs' => ['admin.catalogs.index', 'admin/catalogs/index'],
    'statistics' => ['admin.statistics.index', 'admin/statistics/index'],
    'settings' => ['admin.settings.index', 'admin/settings/index'],
]);

test('cyclist can not access operational admin modules', function (string $routeName) {
    $cyclist = User::factory()->cyclist()->create();

    $this->actingAs($cyclist)
        ->get(route($routeName))
        ->assertForbidden();
})->with([
    'admin.catalogs.index',
    'admin.statistics.index',
    'admin.settings.index',
]);

test('legacy admin settings URL redirects administrators to technical information', function () {
    $admin = User::factory()->administrator()->create();

    $this->actingAs($admin)
        ->get(route('admin.settings.legacy'))
        ->assertRedirect(route('admin.settings.index'));
});

test('guests cannot reach technical information through the legacy URL', function () {
    $this->get(route('admin.settings.legacy'))
        ->assertRedirect(route('login'));
});

test('administrator can browse catalog records with search and pagination', function () {
    $this->withoutVite();

    $admin = User::factory()->administrator()->create();

    RouteCategory::query()->create([
        'name' => 'gravel visible',
        'description' => 'Ruta mixta de ripio y asfalto.',
    ]);
    RouteCategory::query()->create([
        'name' => 'otra categoria',
        'description' => 'Categoria fuera de la busqueda.',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.catalogs.index', [
            'catalog' => 'route-categories',
            'search' => 'visible',
            'per_page' => 10,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/catalogs/index')
            ->where('domain.slug', 'routes')
            ->where('catalog.slug', 'route-categories')
            ->where('catalog.domain', 'routes')
            ->where('catalog.has_description', true)
            ->where('filters.domain', 'routes')
            ->where('filters.catalog', 'route-categories')
            ->where('filters.search', 'visible')
            ->where('filters.per_page', 10)
            ->where('records.per_page', 10)
            ->has('records.data', 1)
            ->where('records.data.0.name', 'gravel visible')
            ->has('domains', 6)
            ->where('domains.1.slug', 'routes')
            ->has('domains.1.catalogs', 5));
});

test('catalog selection derives its segment and validates inconsistent selections', function () {
    $this->withoutVite();

    $admin = User::factory()->administrator()->create();

    $this->actingAs($admin)
        ->get(route('admin.catalogs.index', ['catalog' => 'route-categories']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('domain.slug', 'routes')
            ->where('filters.domain', 'routes')
            ->where('catalog.slug', 'route-categories'));

    $this->actingAs($admin)
        ->get(route('admin.catalogs.index', ['domain' => 'pois']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('domain.slug', 'pois')
            ->where('catalog.slug', 'poi-categories'));

    $this->actingAs($admin)
        ->get(route('admin.catalogs.index', [
            'domain' => 'pois',
            'catalog' => 'route-categories',
        ]))
        ->assertRedirect()
        ->assertSessionHasErrors('catalog');
});

test('administrator can create and update catalog records', function () {
    $admin = User::factory()->administrator()->create();

    $this->actingAs($admin)
        ->post(route('admin.catalogs.store', 'route-categories'), [
            'name' => 'gravel',
            'description' => 'Ruta mixta de ripio y asfalto.',
            'active' => true,
        ])
        ->assertRedirect();

    $category = RouteCategory::query()->where('name', 'Gravel')->firstOrFail();

    $this->actingAs($admin)
        ->patch(route('admin.catalogs.update', ['route-categories', $category]), [
            'name' => 'gravel turístico',
            'description' => 'Ruta turística de ripio y asfalto.',
            'active' => false,
        ])
        ->assertRedirect();

    $category->refresh();

    expect($category->name)->toBe('Gravel turístico')
        ->and($category->description)->toBe('Ruta turística de ripio y asfalto.')
        ->and((bool) $category->active)->toBeFalse();
});

test('statistics export returns csv', function () {
    $admin = User::factory()->administrator()->create();

    $this->actingAs($admin)
        ->get(route('admin.statistics.export'))
        ->assertOk()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');
});
