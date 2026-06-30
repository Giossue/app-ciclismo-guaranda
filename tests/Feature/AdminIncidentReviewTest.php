<?php

use App\Models\CyclingRoute;
use App\Models\Incident;
use App\Models\IncidentStatus;
use App\Models\IncidentType;
use App\Models\RouteCategory;
use App\Models\RouteDifficulty;
use App\Models\RouteStatus;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

function createIncidentForAdminReview(): Incident
{
    static $sequence = 0;

    $sequence++;
    $admin = User::factory()->administrator()->create();
    $cyclist = User::factory()->cyclist()->create();
    $routeStatus = RouteStatus::query()->where('name', 'activa')->firstOrFail();
    $routeCategory = RouteCategory::query()->where('name', 'turística')->firstOrFail();
    $difficulty = RouteDifficulty::query()->where('name', 'media')->firstOrFail();
    $incidentType = IncidentType::query()->where('name', 'vía cerrada')->firstOrFail();
    $incidentStatus = IncidentStatus::query()->where('name', 'reportada')->firstOrFail();

    $route = CyclingRoute::query()->create([
        'admin_user_id' => $admin->id,
        'route_difficulty_id' => $difficulty->id,
        'route_status_id' => $routeStatus->id,
        'route_category_id' => $routeCategory->id,
        'name' => "Ruta revisión incidencia {$sequence}",
        'slug' => "ruta-revision-incidencia-{$sequence}",
        'description' => 'Ruta para revisar incidencias.',
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

    return $route->incidents()->create([
        'user_id' => $cyclist->id,
        'incident_type_id' => $incidentType->id,
        'incident_status_id' => $incidentStatus->id,
        'title' => 'Vía cerrada por maquinaria',
        'description' => 'Maquinaria bloquea el paso en una curva.',
        'latitude' => -1.405,
        'longitude' => -79.021,
        'reported_at' => now(),
    ]);
}

test('administrator can view incident review page', function () {
    $this->withoutVite();

    $admin = User::factory()->administrator()->create();
    createIncidentForAdminReview();

    $this->actingAs($admin)
        ->get(route('admin.incidents.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/incidents/index')
            ->has('incidents.data', 1)
            ->where('incidents.data.0.title', 'Vía cerrada por maquinaria')
            ->has('statuses', 4)
            ->has('types', 6));
});

test('cyclist can not access incident review page', function () {
    $cyclist = User::factory()->cyclist()->create();
    $incident = createIncidentForAdminReview();
    $inReview = IncidentStatus::query()->where('name', 'en revisión')->firstOrFail();

    $this->actingAs($cyclist)
        ->get(route('admin.incidents.index'))
        ->assertForbidden();

    $this->actingAs($cyclist)
        ->patch(route('admin.incidents.update', $incident), [
            'incident_status_id' => $inReview->id,
            'admin_response' => 'Validada.',
        ])
        ->assertForbidden();
});

test('administrator can review incident and notify reporter', function () {
    $admin = User::factory()->administrator()->create();
    $incident = createIncidentForAdminReview();
    $inReview = IncidentStatus::query()->where('name', 'en revisión')->firstOrFail();

    $this->actingAs($admin)
        ->patch(route('admin.incidents.update', $incident), [
            'incident_status_id' => $inReview->id,
            'admin_response' => 'Validada como riesgo activo para ciclistas.',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $incident->refresh();

    expect($incident->status?->name)->toBe('en revisión')
        ->and($incident->admin_response)->toBe('Validada como riesgo activo para ciclistas.')
        ->and($incident->resolved_at)->toBeNull();

    $this->assertDatabaseHas('notificaciones_app', [
        'user_id' => $incident->user_id,
        'type' => 'incident_reviewed',
        'read' => false,
    ]);
});

test('resolved incident stores resolved timestamp', function () {
    $admin = User::factory()->administrator()->create();
    $incident = createIncidentForAdminReview();
    $resolved = IncidentStatus::query()->where('name', 'resuelta')->firstOrFail();

    $this->actingAs($admin)
        ->patch(route('admin.incidents.update', $incident), [
            'incident_status_id' => $resolved->id,
            'admin_response' => 'Retirada la maquinaria.',
        ])
        ->assertSessionHasNoErrors();

    $incident->refresh();

    expect($incident->status?->name)->toBe('resuelta')
        ->and($incident->resolved_at)->not->toBeNull();
});
