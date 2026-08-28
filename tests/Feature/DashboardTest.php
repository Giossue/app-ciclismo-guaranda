<?php

use App\Models\CyclingRoute;
use App\Models\RouteCategory;
use App\Models\RouteDifficulty;
use App\Models\RouteStatus;
use App\Models\Track;
use App\Models\TrackStatus;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

function createRouteForDashboard(): CyclingRoute
{
    return CyclingRoute::query()->create([
        'admin_user_id' => User::factory()->administrator()->create()->id,
        'route_difficulty_id' => RouteDifficulty::query()->where('name', 'Fácil')->firstOrFail()->id,
        'route_status_id' => RouteStatus::query()->where('name', 'Activa')->firstOrFail()->id,
        'route_category_id' => RouteCategory::query()->where('name', 'Urbana')->firstOrFail()->id,
        'name' => 'Ruta para dashboard',
        'slug' => 'ruta-para-dashboard',
        'description' => 'Ruta usada para comprobar el progreso del ciclista.',
        'start_name' => 'Inicio',
        'start_latitude' => -1.5900000,
        'start_longitude' => -79.0000000,
        'end_name' => 'Final',
        'end_latitude' => -1.5800000,
        'end_longitude' => -79.0100000,
        'route_version' => 1,
    ]);
}

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated cyclists are redirected to their dashboard', function () {
    $user = User::factory()->cyclist()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('user.dashboard'));
});

test('cyclist can view the dashboard', function () {
    $this->withoutVite();

    $this->actingAs(User::factory()->cyclist()->create())
        ->get(route('user.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('user/dashboard')
            ->where('progress.completed_tracks', 0)
            ->where('progress.distance_km', 0)
            ->where('progress.total_time_seconds', 0));
});

test('dashboard progress only includes the cyclists completed tracks', function () {
    $this->withoutVite();

    $cyclist = User::factory()->cyclist()->create();
    $anotherCyclist = User::factory()->cyclist()->create();
    $route = createRouteForDashboard();
    $completed = TrackStatus::query()->where('name', 'Finalizado')->firstOrFail();
    $cancelled = TrackStatus::query()->where('name', 'Cancelado')->firstOrFail();

    foreach ([
        [$cyclist, $completed, 12.5, 3600],
        [$cyclist, $completed, 4.25, 900],
        [$cyclist, $cancelled, 30, 7200],
        [$anotherCyclist, $completed, 50, 10800],
    ] as [$user, $status, $distance, $seconds]) {
        Track::query()->create([
            'user_id' => $user->id,
            'route_id' => $route->id,
            'track_status_id' => $status->id,
            'started_at' => now()->subSeconds($seconds),
            'ended_at' => now(),
            'distance_traveled_km' => $distance,
            'total_time_seconds' => $seconds,
            'completion_percentage' => 100,
            'is_valid' => true,
        ]);
    }

    $this->actingAs($cyclist)
        ->get(route('user.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('user/dashboard')
            ->where('progress.completed_tracks', 2)
            ->where('progress.distance_km', 16.8)
            ->where('progress.total_time_seconds', 4500));
});

test('legacy cyclist entry points redirect to the user namespace', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/routes')
        ->assertRedirect(route('routes.index'));
});
