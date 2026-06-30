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

test('administrator can create and update catalog records', function () {
    $admin = User::factory()->administrator()->create();

    $this->actingAs($admin)
        ->post(route('admin.catalogs.store', 'route-categories'), [
            'name' => 'gravel',
            'description' => 'Ruta mixta de ripio y asfalto.',
            'active' => true,
        ])
        ->assertRedirect();

    $category = RouteCategory::query()->where('name', 'gravel')->firstOrFail();

    $this->actingAs($admin)
        ->patch(route('admin.catalogs.update', ['route-categories', $category]), [
            'name' => 'gravel turístico',
            'description' => 'Ruta turística de ripio y asfalto.',
            'active' => false,
        ])
        ->assertRedirect();

    $category->refresh();

    expect($category->name)->toBe('gravel turístico')
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
