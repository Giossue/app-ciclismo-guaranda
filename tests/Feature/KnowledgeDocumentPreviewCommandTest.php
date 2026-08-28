<?php

use App\Models\CyclingRoute;
use App\Models\RouteCategory;
use App\Models\RouteDifficulty;
use App\Models\RouteStatus;
use App\Models\User;
use Database\Seeders\CatalogSeeder;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

function routeForKnowledgePreview(): CyclingRoute
{
    return CyclingRoute::query()->create([
        'admin_user_id' => User::factory()->administrator()->create()->id,
        'route_difficulty_id' => RouteDifficulty::query()->where('name', 'Media')->sole()->id,
        'route_status_id' => RouteStatus::query()->where('name', 'Activa')->sole()->id,
        'route_category_id' => RouteCategory::query()->where('name', 'Turística')->sole()->id,
        'name' => 'Ruta de previsualización',
        'slug' => 'ruta-de-previsualizacion',
        'description' => 'Contenido público para revisar antes de vectorizar.',
        'start_name' => 'Inicio',
        'start_latitude' => -1.5926,
        'start_longitude' => -79.0009,
        'end_name' => 'Final',
        'end_latitude' => -1.5801,
        'end_longitude' => -78.9901,
        'road_type' => 'Asfalto',
        'required_experience' => 'Básica',
        'route_version' => 1,
    ]);
}

test('knowledge preview lists public documents without writing embeddings', function () {
    routeForKnowledgePreview();

    $this->artisan('ai:knowledge:preview --limit=1')
        ->expectsOutputToContain('Documentos públicos listos para indexar: 1')
        ->expectsOutputToContain('Ruta de previsualización')
        ->expectsOutputToContain('Solo lectura: no se generaron embeddings ni se modificó la base de datos.')
        ->assertExitCode(0);
});

test('knowledge preview rejects an unsafe limit', function () {
    $this->artisan('ai:knowledge:preview --limit=101')
        ->expectsOutput('La opción --limit debe ser un entero entre 1 y 100.')
        ->assertExitCode(2);
});
