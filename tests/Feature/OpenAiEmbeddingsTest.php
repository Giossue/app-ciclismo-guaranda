<?php

use App\Services\Ai\OpenAiEmbeddings;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Http::preventStrayRequests();
    config([
        'guaranda.assistant.openai.api_key' => 'test-openai-key',
        'guaranda.assistant.openai.embedding_model' => 'text-embedding-3-large',
        'guaranda.assistant.openai.embedding_dimensions' => 3072,
    ]);
});

test('embeddings sends only approved public text and validates the native dimension', function () {
    Http::fake([
        'https://api.openai.com/v1/embeddings' => Http::response([
            'model' => 'text-embedding-3-large',
            'data' => [[
                'index' => 0,
                'embedding' => array_fill(0, 3072, 0.125),
            ]],
            'usage' => ['prompt_tokens' => 4],
        ], 200),
    ]);

    $embeddings = app(OpenAiEmbeddings::class)->embed(['Ruta pública para Guaranda.']);

    expect($embeddings)->toHaveCount(1)
        ->and($embeddings[0])->toHaveCount(3072)
        ->and($embeddings[0][0])->toBeFloat();

    Http::assertSent(function (Request $request): bool {
        return $request->url() === 'https://api.openai.com/v1/embeddings'
            && $request->data()['model'] === 'text-embedding-3-large'
            && $request->data()['dimensions'] === 3072
            && $request->data()['input'] === ['Ruta pública para Guaranda.'];
    });
});

test('embeddings reject an oversized or empty document before contacting OpenAI', function () {
    Http::fake();

    expect(fn () => app(OpenAiEmbeddings::class)->embed(['']))
        ->toThrow(InvalidArgumentException::class);
    expect(fn () => app(OpenAiEmbeddings::class)->embed([str_repeat('a', 20_001)]))
        ->toThrow(InvalidArgumentException::class);

    Http::assertNothingSent();
});
