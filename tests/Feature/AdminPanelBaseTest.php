<?php

use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Inertia\Inertia;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('administrator can access admin dashboard', function () {
    $this->withoutVite();

    $admin = User::factory()->administrator()->create();

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->has('overview', 5)
            // Los bloques pesados se difieren: no viajan en la primera respuesta.
            ->missing('activity')
            ->missing('routeStatuses')
            ->missing('recentIncidents'));

    $this->actingAs($admin)
        ->withHeaders([
            'X-Inertia' => 'true',
            'X-Inertia-Version' => Inertia::getVersion(),
            'X-Inertia-Partial-Component' => 'admin/dashboard',
            'X-Inertia-Partial-Data' => 'activity,routeStatuses,popularRoutes,attention,recentIncidents',
        ])
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertJsonCount(7, 'props.activity.days')
        ->assertJsonCount(2, 'props.attention')
        ->assertJsonStructure([
            'props' => ['routeStatuses', 'popularRoutes', 'recentIncidents'],
        ]);
});

test('admin index redirects to admin dashboard', function () {
    $admin = User::factory()->administrator()->create();

    $this->actingAs($admin)
        ->get(route('admin.index'))
        ->assertRedirect(route('admin.dashboard'));
});

test('dashboard route redirects users to their role home', function (string $state, string $expectedRoute) {
    $user = User::factory()->{$state}()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route($expectedRoute));
})->with([
    'administrator' => ['administrator', 'admin.dashboard'],
    'cyclist' => ['cyclist', 'maps.index'],
]);

test('cyclist can not access admin dashboard', function () {
    $cyclist = User::factory()->cyclist()->create();

    $this->actingAs($cyclist)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('guest is redirected from admin dashboard to login', function () {
    $this->get(route('admin.dashboard'))
        ->assertRedirect(route('login'));
});

test('administrator can access base admin module pages', function (string $routeName) {
    $this->withoutVite();

    $admin = User::factory()->administrator()->create();

    $this->actingAs($admin)
        ->get(route($routeName))
        ->assertOk();
})->with([
    'admin.routes.index',
    'admin.pois.index',
    'admin.incidents.index',
    'admin.ratings.index',
    'admin.catalogs.index',
    'admin.statistics.index',
    'admin.settings.index',
    'admin.users.index',
]);

test('cyclist can not access base admin module pages', function (string $routeName) {
    $cyclist = User::factory()->cyclist()->create();

    $this->actingAs($cyclist)
        ->get(route($routeName))
        ->assertForbidden();
})->with([
    'admin.routes.index',
    'admin.pois.index',
    'admin.incidents.index',
    'admin.ratings.index',
    'admin.catalogs.index',
    'admin.statistics.index',
    'admin.settings.index',
    'admin.users.index',
]);
