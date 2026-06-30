<?php

use App\Models\CyclingRoute;
use App\Models\Incident;
use App\Models\IncidentStatus;
use App\Models\IncidentType;
use App\Models\RouteCategory;
use App\Models\RouteDifficulty;
use App\Models\RouteStatus;
use App\Models\TransportMode;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

function createRouteForIncidentReports(string $statusName = 'activa'): CyclingRoute
{
    static $sequence = 0;

    $sequence++;
    $admin = User::factory()->administrator()->create();
    $status = RouteStatus::query()->where('name', $statusName)->firstOrFail();
    $category = RouteCategory::query()->where('name', 'turística')->firstOrFail();
    $difficulty = RouteDifficulty::query()->where('name', 'media')->firstOrFail();
    $transportMode = TransportMode::query()->where('name', 'bicicleta')->firstOrFail();

    $route = CyclingRoute::query()->create([
        'admin_user_id' => $admin->id,
        'route_difficulty_id' => $difficulty->id,
        'route_status_id' => $status->id,
        'route_category_id' => $category->id,
        'name' => "Ruta incidencia {$sequence}",
        'slug' => "ruta-incidencia-{$sequence}",
        'description' => 'Ruta para validar reportes de incidencias.',
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

    return $route;
}

test('cyclist can report an incident with optional photo and admin notification', function () {
    Storage::fake('public');

    $cyclist = User::factory()->cyclist()->create();
    $admin = User::factory()->administrator()->create();
    $route = createRouteForIncidentReports();
    $type = IncidentType::query()->where('name', 'derrumbe')->firstOrFail();

    $this->actingAs($cyclist)
        ->post(route('incidents.store'), [
            'route_id' => $route->id,
            'incident_type_id' => $type->id,
            'title' => 'Derrumbe pequeño',
            'description' => 'Hay piedras ocupando media vía cerca del km 4.',
            'latitude' => -1.405,
            'longitude' => -79.021,
            'photo' => UploadedFile::fake()->image('derrumbe.jpg')->size(900),
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $incident = Incident::query()->where('title', 'Derrumbe pequeño')->firstOrFail();

    expect($incident->status?->name)->toBe('reportada')
        ->and($incident->files()->count())->toBe(1);

    Storage::disk('public')->assertExists($incident->files()->firstOrFail()->file_path);

    $this->assertDatabaseHas('notificaciones_app', [
        'user_id' => $admin->id,
        'type' => 'incident_reported',
        'read' => false,
    ]);
});

test('incident photo can not exceed five megabytes', function () {
    Storage::fake('public');

    $cyclist = User::factory()->cyclist()->create();
    $route = createRouteForIncidentReports();
    $type = IncidentType::query()->where('name', 'obstáculo')->firstOrFail();

    $this->actingAs($cyclist)
        ->post(route('incidents.store'), [
            'route_id' => $route->id,
            'incident_type_id' => $type->id,
            'title' => 'Foto pesada',
            'description' => 'La imagen supera el límite.',
            'latitude' => -1.405,
            'longitude' => -79.021,
            'photo' => UploadedFile::fake()->image('pesada.jpg')->size(5121),
        ])
        ->assertSessionHasErrors('photo');
});

test('incident must belong to an active route', function () {
    $cyclist = User::factory()->cyclist()->create();
    $route = createRouteForIncidentReports('inactiva');
    $type = IncidentType::query()->where('name', 'obstáculo')->firstOrFail();

    $this->actingAs($cyclist)
        ->post(route('incidents.store'), [
            'route_id' => $route->id,
            'incident_type_id' => $type->id,
            'title' => 'Obstáculo',
            'description' => 'Reporte en ruta inactiva.',
            'latitude' => -1.405,
            'longitude' => -79.021,
        ])
        ->assertSessionHasErrors('route_id');
});

test('cyclist sees only incidents in review on route detail', function () {
    $this->withoutVite();

    $cyclist = User::factory()->cyclist()->create();
    $route = createRouteForIncidentReports();
    $type = IncidentType::query()->where('name', 'obstáculo')->firstOrFail();
    $reported = IncidentStatus::query()->where('name', 'reportada')->firstOrFail();
    $inReview = IncidentStatus::query()->where('name', 'en revisión')->firstOrFail();

    $route->incidents()->createMany([
        [
            'user_id' => $cyclist->id,
            'incident_type_id' => $type->id,
            'incident_status_id' => $reported->id,
            'title' => 'No visible todavía',
            'description' => 'Debe esperar revisión.',
            'latitude' => -1.404,
            'longitude' => -79.02,
            'reported_at' => now(),
        ],
        [
            'user_id' => $cyclist->id,
            'incident_type_id' => $type->id,
            'incident_status_id' => $inReview->id,
            'title' => 'Visible en revisión',
            'description' => 'Ya fue validada como activa.',
            'latitude' => -1.405,
            'longitude' => -79.021,
            'reported_at' => now(),
        ],
    ]);

    $this->actingAs($cyclist)
        ->get(route('routes.show', $route->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('routes/show')
            ->has('incidentTypes', 6)
            ->has('route.incidents', 1)
            ->where('route.incidents.0.title', 'Visible en revisión'));
});
