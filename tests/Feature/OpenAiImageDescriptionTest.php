<?php

use App\Services\Ai\OpenAiImageDescriber;
use Illuminate\Http\Client\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

function imageDescriptionResponse(string $description): array
{
    return [
        'model' => 'test-vision-model',
        'status' => 'completed',
        'output' => [[
            'type' => 'message',
            'content' => [[
                'type' => 'output_text',
                'text' => json_encode(['description' => $description], JSON_THROW_ON_ERROR),
            ]],
        ]],
    ];
}

test('image description sends an approved managed image to OpenAI without storing the response', function () {
    Storage::fake('public');
    config([
        'guaranda.assistant.openai.api_key' => 'test-openai-key',
        'guaranda.assistant.openai.vision_model' => 'test-vision-model',
    ]);
    $path = UploadedFile::fake()->image('mirador.jpg')->store('routes', 'public');

    Http::fake([
        'https://api.openai.com/v1/responses' => Http::response(
            imageDescriptionResponse('Vista de una ruta junto a montañas andinas.'),
            200,
        ),
    ]);

    $description = app(OpenAiImageDescriber::class)->describe($path);

    expect($description)->toBe('Vista de una ruta junto a montañas andinas.');

    Http::assertSent(function (Request $request): bool {
        $payload = $request->data();

        return $request->url() === 'https://api.openai.com/v1/responses'
            && $payload['store'] === false
            && $payload['model'] === 'test-vision-model'
            && data_get($payload, 'input.0.content.1.type') === 'input_image'
            && str_starts_with((string) data_get($payload, 'input.0.content.1.image_url'), 'data:image/')
            && data_get($payload, 'input.0.content.1.detail') === 'low';
    });
});

test('image description refuses an unavailable managed file before contacting OpenAI', function () {
    Storage::fake('public');
    config([
        'guaranda.assistant.openai.api_key' => 'test-openai-key',
        'guaranda.assistant.openai.vision_model' => 'test-vision-model',
    ]);
    Http::fake();

    app(OpenAiImageDescriber::class)->describe('routes/missing.jpg');
})->throws(RuntimeException::class, 'Managed image file no longer exists.');
