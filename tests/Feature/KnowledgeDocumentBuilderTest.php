<?php

use App\Models\CyclingRoute;
use App\Models\Incident;
use App\Models\IncidentStatus;
use App\Models\IncidentType;
use App\Models\PoiCategory;
use App\Models\PointOfInterest;
use App\Models\RouteCategory;
use App\Models\RouteDifficulty;
use App\Models\RouteStatus;
use App\Models\TransportMode;
use App\Models\User;
use App\Services\Ai\KnowledgeDocumentBuilder;
use Database\Seeders\CatalogSeeder;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

function knowledgeRoute(string $statusName, string $name): CyclingRoute
{
    $admin = User::factory()->administrator()->create();

    return CyclingRoute::query()->create([
        'admin_user_id' => $admin->id,
        'route_difficulty_id' => RouteDifficulty::query()->where('name', 'Media')->sole()->id,
        'route_status_id' => RouteStatus::query()->where('name', $statusName)->sole()->id,
        'route_category_id' => RouteCategory::query()->where('name', 'Turística')->sole()->id,
        'name' => $name,
        'slug' => str($name)->slug()->toString(),
        'description' => "Descripción pública de {$name}.",
        'start_name' => 'Parque central',
        'start_latitude' => -1.5926,
        'start_longitude' => -79.0009,
        'end_name' => 'Mirador andino',
        'end_latitude' => -1.5801,
        'end_longitude' => -78.9901,
        'road_type' => 'Asfalto',
        'required_experience' => 'Básica',
        'route_version' => 1,
    ]);
}

function knowledgePoi(string $name, bool $active = true): PointOfInterest
{
    return PointOfInterest::query()->create([
        'poi_category_id' => PoiCategory::query()->where('name', 'Comida')->sole()->id,
        'name' => $name,
        'description' => "Descripción pública de {$name}.",
        'observations' => 'Lleva agua suficiente.',
        'address' => 'Centro de Guaranda',
        'latitude' => -1.593,
        'longitude' => -79.001,
        'active' => $active,
    ]);
}

function knowledgeIncident(CyclingRoute $route, string $statusName, string $description): Incident
{
    return Incident::query()->create([
        'user_id' => User::factory()->cyclist()->create()->id,
        'route_id' => $route->id,
        'incident_type_id' => IncidentType::query()->where('name', 'Derrumbe')->sole()->id,
        'incident_status_id' => IncidentStatus::query()->where('name', $statusName)->sole()->id,
        'description' => "Descripción pública de {$description}.",
        'latitude' => -1.591,
        'longitude' => -79.002,
        'reported_at' => now(),
    ]);
}

test('knowledge documents include only public routes, POIs and visible alerts', function () {
    $activeRoute = knowledgeRoute('Activa', 'Ruta pública');
    $draftRoute = knowledgeRoute('Borrador', 'Ruta borrador');
    $activePoi = knowledgePoi('Comedor público');
    $hiddenPoi = knowledgePoi('Comedor oculto', false);

    $activeRoute->pointsOfInterest()->attach($activePoi->id, ['sort_order' => 1]);
    $activeRoute->pointsOfInterest()->attach($hiddenPoi->id, ['sort_order' => 2]);
    $activePoi->images()->create([
        'image_path' => 'pois/comedor.jpg',
        'description' => 'Fachada de un comedor junto a la ruta.',
        'sort_order' => 0,
    ]);
    $activePoi->hours()->create([
        'weekday' => 1,
        'opens_at' => '08:00',
        'closes_at' => '17:00',
    ]);
    $activePoi->foodDetail()->create([
        'has_wifi' => true,
        'has_bike_parking' => true,
        'chef_recommendation' => 'Prueba la sopa tradicional.',
    ]);
    $activeRoute->images()->create([
        'image_path' => 'routes/ruta.jpg',
        'description' => 'Vista del recorrido desde el mirador.',
        'sort_order' => 0,
    ]);
    $activeRoute->metrics()->create([
        'route_version' => 1,
        'transport_mode_id' => TransportMode::query()->where('name', 'Bicicleta')->sole()->id,
        'distance_km' => 12.5,
        'estimated_time_minutes' => 75,
        'positive_elevation_m' => 140,
        'negative_elevation_m' => 90,
    ]);
    knowledgeIncident($activeRoute, 'En revisión', 'Derrumbe visible');
    knowledgeIncident($activeRoute, 'Reportada', 'Alerta no revisada');
    knowledgeIncident($draftRoute, 'En revisión', 'Alerta de ruta borrador');

    $documents = app(KnowledgeDocumentBuilder::class)->all();
    $contents = $documents->pluck('content')->implode("\n");

    expect($documents)->toHaveCount(4)
        ->and($documents->pluck('source_type')->all())->toContain('route', 'poi', 'incident')
        ->and($contents)->toContain('Ruta pública')
        ->and($contents)->toContain('Comedor público')
        ->and($contents)->toContain('Fachada de un comedor junto a la ruta.')
        ->and($contents)->toContain('Vista del recorrido desde el mirador.')
        ->and($contents)->toContain('Tiene wifi')
        ->and($contents)->toContain('Tiene estacionamiento para bicicletas')
        ->and($contents)->toContain('Prueba la sopa tradicional.')
        ->and($contents)->toContain('Derrumbe visible')
        ->and($contents)->not->toContain('Ruta borrador')
        ->and($contents)->not->toContain('Comedor oculto')
        ->and($contents)->not->toContain('Alerta no revisada')
        ->and($contents)->not->toContain('Alerta de ruta borrador');

    expect($documents->every(fn (array $document): bool => $document['language'] === 'es'
        && strlen($document['checksum']) === 64
        && ! array_key_exists('user_id', $document['metadata'])
        && ! str_contains($document['content'], '-79.002')))->toBeTrue();
});

test('knowledge documents have stable checksums until public source data changes', function () {
    $route = knowledgeRoute('Activa', 'Ruta checksum');

    $first = app(KnowledgeDocumentBuilder::class)->all()
        ->first(fn (array $document): bool => $document['source_type'] === 'route' && $document['source_id'] === $route->id);
    $second = app(KnowledgeDocumentBuilder::class)->all()
        ->first(fn (array $document): bool => $document['source_type'] === 'route' && $document['source_id'] === $route->id);

    expect($first)->not->toBeNull()
        ->and($first['checksum'])->toBe($second['checksum']);

    $route->update(['description' => 'Descripción pública actualizada.']);

    $updated = app(KnowledgeDocumentBuilder::class)->all()
        ->first(fn (array $document): bool => $document['source_type'] === 'route' && $document['source_id'] === $route->id);

    expect($updated)->not->toBeNull()
        ->and($updated['checksum'])->not->toBe($first['checksum']);
});

test('route POI fragments remain distinct when the same POI belongs to multiple routes', function () {
    $firstRoute = knowledgeRoute('Activa', 'Ruta uno');
    $secondRoute = knowledgeRoute('Activa', 'Ruta dos');
    $poi = knowledgePoi('POI compartido');
    $firstRoute->pointsOfInterest()->attach($poi->id, ['sort_order' => 1]);
    $secondRoute->pointsOfInterest()->attach($poi->id, ['sort_order' => 1]);

    $keys = app(KnowledgeDocumentBuilder::class)->all()
        ->where('section', 'route_poi')
        ->pluck('document_key')
        ->all();

    expect($keys)->toEqualCanonicalizing([
        "route:{$firstRoute->id}:poi:{$poi->id}:route_poi",
        "route:{$secondRoute->id}:poi:{$poi->id}:route_poi",
    ]);
});
