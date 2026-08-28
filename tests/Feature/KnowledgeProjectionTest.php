<?php

use App\Jobs\SyncKnowledgeProjection;
use App\Models\AiKnowledgeDocument;
use App\Services\Ai\KnowledgeProjectionDispatcher;
use App\Services\Ai\KnowledgeProjectionSynchronizer;
use Illuminate\Support\Facades\Queue;

use function Pest\Laravel\mock;

test('knowledge projection table preserves public document metadata in SQLite tests', function () {
    $document = AiKnowledgeDocument::query()->create([
        'document_key' => 'route:1:route',
        'source_type' => 'route',
        'source_id' => 1,
        'section' => 'route',
        'language' => 'es',
        'content' => 'Ruta pública.',
        'checksum' => str_repeat('a', 64),
        'metadata' => ['route_id' => 1],
    ]);

    expect($document->fresh()?->metadata)->toBe(['route_id' => 1]);
});

test('knowledge projection dispatches once only when embeddings are configured', function () {
    Queue::fake();
    config([
        'guaranda.assistant.openai.api_key' => 'test-openai-key',
        'guaranda.assistant.openai.embedding_model' => 'text-embedding-3-large',
        'guaranda.assistant.openai.embedding_dimensions' => 3072,
    ]);

    app(KnowledgeProjectionDispatcher::class)->afterCommit();

    Queue::assertPushed(SyncKnowledgeProjection::class, 1);
});

test('knowledge projection job skips safely when embeddings are unavailable', function () {
    $synchronizer = mock(KnowledgeProjectionSynchronizer::class);
    $synchronizer->shouldReceive('configured')->once()->andReturnFalse();
    $synchronizer->shouldNotReceive('sync');

    (new SyncKnowledgeProjection)->handle($synchronizer);
});
