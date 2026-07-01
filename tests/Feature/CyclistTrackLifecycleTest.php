<?php

use App\Models\CyclingRoute;
use App\Models\RouteCategory;
use App\Models\RouteDifficulty;
use App\Models\RouteStatus;
use App\Models\RoutingEngine;
use App\Models\Track;
use App\Models\TransportMode;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

function createRouteForTrackLifecycle(string $statusName = 'activa', float $distanceKm = 10.0): CyclingRoute
{
    static $sequence = 0;

    $sequence++;
    $admin = User::factory()->administrator()->create();
    $status = RouteStatus::query()->where('name', $statusName)->firstOrFail();
    $category = RouteCategory::query()->where('name', 'turística')->firstOrFail();
    $difficulty = RouteDifficulty::query()->where('name', 'media')->firstOrFail();
    $transportMode = TransportMode::query()->where('name', 'bicicleta')->firstOrFail();
    $routingEngine = RoutingEngine::query()->where('name', 'OSRM')->firstOrFail();

    $route = CyclingRoute::query()->create([
        'admin_user_id' => $admin->id,
        'route_difficulty_id' => $difficulty->id,
        'route_status_id' => $status->id,
        'route_category_id' => $category->id,
        'name' => "Ruta track {$sequence}",
        'slug' => "ruta-track-{$sequence}",
        'description' => 'Ruta para validar ciclo de recorridos GPS.',
        'start_name' => 'Inicio',
        'start_latitude' => 0,
        'start_longitude' => 0,
        'end_name' => 'Final',
        'end_latitude' => 0.09,
        'end_longitude' => 0,
        'road_type' => 'Asfalto',
        'required_experience' => 'Básica.',
        'route_version' => 1,
    ]);

    $route->geometry()->create([
        'geojson' => [
            'type' => 'LineString',
            'coordinates' => [[0, 0], [0, 0.09]],
        ],
    ]);

    $route->metrics()->create([
        'route_version' => 1,
        'transport_mode_id' => $transportMode->id,
        'routing_engine_id' => $routingEngine->id,
        'distance_km' => $distanceKm,
        'estimated_time_minutes' => 60,
        'positive_elevation_m' => 120,
        'negative_elevation_m' => 80,
        'calculated_at' => now(),
    ]);

    return $route;
}

function startTrackForUser(User $user, CyclingRoute $route): Track
{
    test()->actingAs($user)
        ->post(route('tracks.store', $route), [
            'latitude' => $route->start_latitude,
            'longitude' => $route->start_longitude,
            'accuracy_m' => 5,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('routes.show', $route->slug));

    return Track::query()->where('user_id', $user->id)->where('route_id', $route->id)->firstOrFail();
}

test('cyclist can start a track for an active route', function () {
    $cyclist = User::factory()->cyclist()->create();
    $route = createRouteForTrackLifecycle();

    $track = startTrackForUser($cyclist, $route);

    expect($track->status?->name)->toBe('en curso')
        ->and($track->distance_traveled_km)->toBe('0.000')
        ->and($track->is_valid)->toBeFalse();

    $this->actingAs($cyclist)
        ->get(route('routes.show', $route->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('routes/show')
            ->where('activeTrack.id', $track->id)
            ->where('activeTrack.status.name', 'en curso'));
});

test('cyclist can not start track for inactive route or duplicate active track', function () {
    $cyclist = User::factory()->cyclist()->create();
    $activeRoute = createRouteForTrackLifecycle();
    $inactiveRoute = createRouteForTrackLifecycle('inactiva');

    startTrackForUser($cyclist, $activeRoute);

    $this->actingAs($cyclist)
        ->post(route('tracks.store', $activeRoute), [
            'latitude' => $activeRoute->start_latitude,
            'longitude' => $activeRoute->start_longitude,
            'accuracy_m' => 5,
        ])
        ->assertSessionHasErrors('route');

    $this->actingAs($cyclist)
        ->post(route('tracks.store', $inactiveRoute), [
            'latitude' => $inactiveRoute->start_latitude,
            'longitude' => $inactiveRoute->start_longitude,
            'accuracy_m' => 5,
        ])
        ->assertSessionHasErrors('route');
});


test('cyclist can not start a track far from the route start', function () {
    $cyclist = User::factory()->cyclist()->create();
    $route = createRouteForTrackLifecycle();

    $this->actingAs($cyclist)
        ->post(route('tracks.store', $route), [
            'latitude' => 1,
            'longitude' => 1,
            'accuracy_m' => 5,
        ])
        ->assertSessionHasErrors('route');

    expect(Track::query()->where('user_id', $cyclist->id)->where('route_id', $route->id)->exists())->toBeFalse();
});

test('cyclist can add gps points and metrics are recalculated', function () {
    $cyclist = User::factory()->cyclist()->create();
    $route = createRouteForTrackLifecycle(distanceKm: 10.0);
    $track = startTrackForUser($cyclist, $route);

    $this->actingAs($cyclist)
        ->post(route('tracks.points.store', $track), [
            'latitude' => 0,
            'longitude' => 0,
            'elevation_m' => 100,
            'speed_kmh' => 12,
            'accuracy_m' => 5,
            'recorded_at' => now()->toISOString(),
        ])
        ->assertRedirect();

    $this->actingAs($cyclist)
        ->post(route('tracks.points.store', $track), [
            'latitude' => 0.09,
            'longitude' => 0,
            'elevation_m' => 130,
            'speed_kmh' => 18,
            'accuracy_m' => 4,
            'recorded_at' => now()->addMinute()->toISOString(),
        ])
        ->assertRedirect();

    $track->refresh();

    expect($track->gpsPoints()->count())->toBe(3)
        ->and((float) $track->distance_traveled_km)->toBeGreaterThan(9.9)
        ->and((float) $track->completion_percentage)->toBeGreaterThan(90.0)
        ->and((float) $track->summary['elevation_gain_m'])->toBe(30.0);
});

test('cyclist can pause resume finish and produce valid summary', function () {
    $cyclist = User::factory()->cyclist()->create();
    $route = createRouteForTrackLifecycle(distanceKm: 10.0);
    $track = startTrackForUser($cyclist, $route);

    $this->actingAs($cyclist)
        ->patch(route('tracks.pause', $track))
        ->assertRedirect();

    $track->refresh();
    expect($track->status?->name)->toBe('pausado');

    $this->actingAs($cyclist)
        ->post(route('tracks.points.store', $track), [
            'latitude' => 0,
            'longitude' => 0,
        ])
        ->assertSessionHasErrors('track');

    $this->actingAs($cyclist)
        ->patch(route('tracks.resume', $track))
        ->assertRedirect();

    $track->refresh();
    expect($track->status?->name)->toBe('en curso');

    foreach ([[0, 0], [0.09, 0]] as $index => [$latitude, $longitude]) {
        $this->actingAs($cyclist)
            ->post(route('tracks.points.store', $track), [
                'latitude' => $latitude,
                'longitude' => $longitude,
                'recorded_at' => now()->addSeconds($index * 60)->toISOString(),
            ])
            ->assertRedirect();
    }

    $this->actingAs($cyclist)
        ->patch(route('tracks.finish', $track))
        ->assertRedirect(route('tracks.show', $track));

    $track->refresh();

    expect($track->status?->name)->toBe('finalizado')
        ->and($track->ended_at)->not->toBeNull()
        ->and($track->is_valid)->toBeTrue()
        ->and($track->summary['is_valid_for_rating'])->toBeTrue();
});

test('cancelled track is not valid', function () {
    $cyclist = User::factory()->cyclist()->create();
    $route = createRouteForTrackLifecycle();
    $track = startTrackForUser($cyclist, $route);

    $this->actingAs($cyclist)
        ->patch(route('tracks.cancel', $track))
        ->assertRedirect(route('routes.show', $route->slug));

    $track->refresh();

    expect($track->status?->name)->toBe('cancelado')
        ->and($track->is_valid)->toBeFalse();
});

test('track owner can view and export their track', function () {
    $this->withoutVite();

    $cyclist = User::factory()->cyclist()->create();
    $route = createRouteForTrackLifecycle();
    $track = startTrackForUser($cyclist, $route);

    $this->actingAs($cyclist)
        ->get(route('tracks.show', $track))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('tracks/show')
            ->where('track.id', $track->id));

    $this->actingAs($cyclist)
        ->get(route('tracks.export', [$track, 'format' => 'geojson']))
        ->assertOk()
        ->assertJsonPath('type', 'FeatureCollection');

    $this->actingAs($cyclist)
        ->get(route('tracks.export', [$track, 'format' => 'gpx']))
        ->assertOk()
        ->assertHeader('Content-Type', 'application/gpx+xml');
});

test('cyclist can not mutate another user track', function () {
    $owner = User::factory()->cyclist()->create();
    $other = User::factory()->cyclist()->create();
    $route = createRouteForTrackLifecycle();
    $track = startTrackForUser($owner, $route);

    $this->actingAs($other)
        ->patch(route('tracks.pause', $track))
        ->assertForbidden();

    $this->actingAs($other)
        ->post(route('tracks.points.store', $track), [
            'latitude' => 0,
            'longitude' => 0,
        ])
        ->assertForbidden();
});
