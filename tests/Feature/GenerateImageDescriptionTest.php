<?php

use App\Jobs\GenerateImageDescription;
use App\Models\PoiCategory;
use App\Models\PoiImage;
use App\Models\PointOfInterest;
use App\Services\Ai\OpenAiImageDescriber;
use Database\Seeders\CatalogSeeder;

use function Pest\Laravel\mock;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

function poiImageForDescription(?string $description = null): PoiImage
{
    $category = PoiCategory::query()->where('name', 'Mirador')->firstOrFail();
    $poi = PointOfInterest::query()->create([
        'poi_category_id' => $category->id,
        'name' => 'POI para descripción IA',
        'latitude' => -1.405,
        'longitude' => -79.021,
        'active' => true,
    ]);

    return $poi->images()->create([
        'image_path' => 'pois/imagen-administrada.jpg',
        'description' => $description,
        'sort_order' => 0,
    ]);
}

test('image description job saves a generated description for an empty managed image', function () {
    $image = poiImageForDescription();
    $describer = mock(OpenAiImageDescriber::class);
    $describer->shouldReceive('configured')->once()->andReturnTrue();
    $describer->shouldReceive('describe')
        ->once()
        ->with('pois/imagen-administrada.jpg')
        ->andReturn('Mirador con vista a un valle andino.');

    (new GenerateImageDescription('poi', $image->id))->handle($describer);

    expect($image->refresh()->description)->toBe('Mirador con vista a un valle andino.');
});

test('image description job preserves a manual description', function () {
    $image = poiImageForDescription('Descripción escrita por administración.');
    $describer = mock(OpenAiImageDescriber::class);
    $describer->shouldReceive('configured')->once()->andReturnTrue();
    $describer->shouldNotReceive('describe');

    (new GenerateImageDescription('poi', $image->id))->handle($describer);

    expect($image->refresh()->description)->toBe('Descripción escrita por administración.');
});

test('image description job does not overwrite a concurrent manual edit', function () {
    $image = poiImageForDescription();
    $describer = mock(OpenAiImageDescriber::class);
    $describer->shouldReceive('configured')->once()->andReturnTrue();
    $describer->shouldReceive('describe')
        ->once()
        ->andReturnUsing(function () use ($image): string {
            $image->update(['description' => 'Descripción manual guardada durante el proceso.']);

            return 'Descripción generada que no debe sobrescribir.';
        });

    (new GenerateImageDescription('poi', $image->id))->handle($describer);

    expect($image->refresh()->description)->toBe('Descripción manual guardada durante el proceso.');
});
