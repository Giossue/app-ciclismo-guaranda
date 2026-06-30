<?php

use App\Models\CyclingRoute;
use App\Models\ModerationStatus;
use App\Models\RouteCategory;
use App\Models\RouteDifficulty;
use App\Models\RouteRating;
use App\Models\RouteStatus;
use App\Models\RoutingEngine;
use App\Models\Track;
use App\Models\TrackStatus;
use App\Models\TransportMode;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

function createRouteForFavoritesAndRatings(float $distanceKm = 10.0): CyclingRoute
{
    static $sequence = 0;

    $sequence++;
    $admin = User::factory()->administrator()->create();
    $status = RouteStatus::query()->where('name', 'activa')->firstOrFail();
    $category = RouteCategory::query()->where('name', 'turística')->firstOrFail();
    $difficulty = RouteDifficulty::query()->where('name', 'media')->firstOrFail();
    $transportMode = TransportMode::query()->where('name', 'bicicleta')->firstOrFail();
    $routingEngine = RoutingEngine::query()->where('name', 'OSRM')->firstOrFail();

    /** @var CyclingRoute $route */
    $route = CyclingRoute::query()->create([
        'admin_user_id' => $admin->id,
        'route_difficulty_id' => $difficulty->id,
        'route_status_id' => $status->id,
        'route_category_id' => $category->id,
        'name' => "Ruta favoritos {$sequence}",
        'slug' => "ruta-favoritos-{$sequence}",
        'description' => 'Ruta para validar favoritos y valoraciones.',
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

function createValidTrackForRating(User $user, CyclingRoute $route): Track
{
    $status = TrackStatus::query()->where('name', 'finalizado')->firstOrFail();

    /** @var Track $track */
    $track = Track::query()->create([
        'user_id' => $user->id,
        'route_id' => $route->id,
        'track_status_id' => $status->id,
        'started_at' => now()->subHour(),
        'ended_at' => now(),
        'distance_traveled_km' => 10,
        'total_time_seconds' => 3600,
        'completion_percentage' => 100,
        'is_valid' => true,
        'summary' => ['is_valid_for_rating' => true],
    ]);

    return $track;
}

test('cyclist can add list and remove favorite routes', function () {
    $this->withoutVite();

    $cyclist = User::factory()->cyclist()->create();
    $route = createRouteForFavoritesAndRatings();

    $this->actingAs($cyclist)
        ->post(route('routes.favorite.store', $route->slug))
        ->assertRedirect();

    $this->assertDatabaseHas('rutas_favoritas_usuario', [
        'user_id' => $cyclist->id,
        'route_id' => $route->id,
    ]);

    $this->actingAs($cyclist)
        ->get(route('favorites.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('favorites/index')
            ->where('favorites.data.0.route.id', $route->id));

    $this->actingAs($cyclist)
        ->delete(route('routes.favorite.destroy', $route->slug))
        ->assertRedirect();

    $this->assertDatabaseMissing('rutas_favoritas_usuario', [
        'user_id' => $cyclist->id,
        'route_id' => $route->id,
    ]);
});

test('rating requires a valid completed track', function () {
    $cyclist = User::factory()->cyclist()->create();
    $route = createRouteForFavoritesAndRatings();

    $this->actingAs($cyclist)
        ->post(route('routes.ratings.store', $route->slug), [
            'rating' => 5,
            'comment' => 'Hermosa ruta.',
        ])
        ->assertSessionHasErrors('route');

    expect(RouteRating::query()->count())->toBe(0);
});

test('cyclist can create and update one rating per route', function () {
    $cyclist = User::factory()->cyclist()->create();
    $route = createRouteForFavoritesAndRatings();
    createValidTrackForRating($cyclist, $route);

    $this->actingAs($cyclist)
        ->post(route('routes.ratings.store', $route->slug), [
            'rating' => 4,
            'comment' => 'Buena señalización.',
        ])
        ->assertRedirect();

    $rating = RouteRating::query()->where('user_id', $cyclist->id)->where('route_id', $route->id)->firstOrFail();

    expect($rating->rating)->toBe(4)
        ->and($rating->moderationStatus?->name)->toBe('pendiente');

    $this->actingAs($cyclist)
        ->post(route('routes.ratings.store', $route->slug), [
            'rating' => 5,
            'comment' => 'Mejor de lo esperado.',
        ])
        ->assertRedirect();

    $rating->refresh();

    expect(RouteRating::query()->where('user_id', $cyclist->id)->where('route_id', $route->id)->count())->toBe(1)
        ->and($rating->rating)->toBe(5)
        ->and($rating->comment)->toBe('Mejor de lo esperado.');
});

test('cyclist can attach media files to a route rating', function () {
    Storage::fake('public');

    $cyclist = User::factory()->cyclist()->create();
    $route = createRouteForFavoritesAndRatings();
    createValidTrackForRating($cyclist, $route);

    $this->actingAs($cyclist)
        ->post(route('routes.ratings.store', $route->slug), [
            'rating' => 5,
            'comment' => 'Linda experiencia con fotos.',
            'media' => [
                UploadedFile::fake()->image('experiencia.jpg'),
            ],
        ])
        ->assertRedirect();

    $rating = RouteRating::query()->where('user_id', $cyclist->id)->where('route_id', $route->id)->firstOrFail();
    $file = $rating->files()->firstOrFail();

    expect($file->file_type)->toBe('image')
        ->and($file->file_path)->toStartWith('route-rating-media/');

    Storage::disk('public')->assertExists($file->file_path);
});

test('admin moderation controls visibility and approved average', function () {
    $this->withoutVite();

    $cyclist = User::factory()->cyclist()->create();
    $otherCyclist = User::factory()->cyclist()->create();
    $admin = User::factory()->administrator()->create();
    $route = createRouteForFavoritesAndRatings();
    createValidTrackForRating($cyclist, $route);
    createValidTrackForRating($otherCyclist, $route);

    $this->actingAs($cyclist)
        ->post(route('routes.ratings.store', $route->slug), [
            'rating' => 5,
            'comment' => 'Excelente experiencia.',
        ])
        ->assertRedirect();

    $this->actingAs($otherCyclist)
        ->post(route('routes.ratings.store', $route->slug), [
            'rating' => 1,
            'comment' => 'No debería contar todavía.',
        ])
        ->assertRedirect();

    $approved = ModerationStatus::query()->where('name', 'aprobado')->firstOrFail();
    $rejected = ModerationStatus::query()->where('name', 'rechazado')->firstOrFail();
    $rating = RouteRating::query()->where('user_id', $cyclist->id)->firstOrFail();
    $rejectedRating = RouteRating::query()->where('user_id', $otherCyclist->id)->firstOrFail();

    $this->actingAs($admin)
        ->patch(route('admin.ratings.update', $rating), [
            'moderation_status_id' => $approved->id,
            'admin_response' => 'Gracias por compartir tu experiencia.',
        ])
        ->assertRedirect();

    $this->actingAs($admin)
        ->patch(route('admin.ratings.update', $rejectedRating), [
            'moderation_status_id' => $rejected->id,
            'admin_response' => 'Comentario no publicado.',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('notificaciones_app', [
        'user_id' => $cyclist->id,
        'type' => 'rating_reviewed',
    ]);

    $this->actingAs($cyclist)
        ->get(route('routes.show', $route->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('routes/show')
            ->where('route.rating_summary.average_rating', 5)
            ->where('route.rating_summary.approved_count', 1)
            ->has('route.approved_ratings', 1)
            ->where('route.approved_ratings.0.comment', 'Excelente experiencia.'));
});
