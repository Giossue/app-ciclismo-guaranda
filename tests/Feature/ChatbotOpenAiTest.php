<?php

use App\Models\AiConversation;
use App\Models\CyclingRoute;
use App\Models\PoiCategory;
use App\Models\PointOfInterest;
use App\Models\RouteCategory;
use App\Models\RouteDifficulty;
use App\Models\RouteStatus;
use App\Models\RoutingEngine;
use App\Models\TransportMode;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
    config(['inertia.ssr.enabled' => false]);
    Http::preventStrayRequests();
});

function createRouteForChatbot(string $statusName = 'Activa'): CyclingRoute
{
    static $sequence = 0;

    $sequence++;
    $admin = User::factory()->administrator()->create();
    $status = RouteStatus::query()->where('name', $statusName)->firstOrFail();
    $category = RouteCategory::query()->where('name', 'Turística')->firstOrFail();
    $difficulty = RouteDifficulty::query()->where('name', 'Media')->firstOrFail();
    $transportMode = TransportMode::query()->where('name', 'Bicicleta')->firstOrFail();
    $routingEngine = RoutingEngine::query()->where('name', 'OSRM')->firstOrFail();

    /** @var CyclingRoute $route */
    $route = CyclingRoute::query()->create([
        'admin_user_id' => $admin->id,
        'route_difficulty_id' => $difficulty->id,
        'route_status_id' => $status->id,
        'route_category_id' => $category->id,
        'name' => "Ruta chatbot {$sequence}",
        'slug' => "ruta-chatbot-{$sequence}",
        'description' => 'Ruta para validar el contexto mínimo enviado al asistente externo.',
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

    $route->metrics()->create([
        'route_version' => 1,
        'transport_mode_id' => $transportMode->id,
        'routing_engine_id' => $routingEngine->id,
        'distance_km' => 12.5,
        'estimated_time_minutes' => 75,
        'positive_elevation_m' => 140,
        'negative_elevation_m' => 90,
        'calculated_at' => now(),
    ]);

    return $route;
}

function configureOpenAiAssistant(): void
{
    config([
        'guaranda.assistant.openai.api_key' => 'test-openai-key',
        'guaranda.assistant.openai.model' => 'test-model',
    ]);
}

/**
 * @param  list<array{kind: 'route'|'poi', id: int}>  $resourceReferences
 */
function openAiResponse(string $text, array $resourceReferences = []): array
{
    return [
        'id' => 'resp_test_123',
        'model' => 'test-model',
        'status' => 'completed',
        'output' => [[
            'type' => 'message',
            'content' => [[
                'type' => 'output_text',
                'text' => json_encode([
                    'reply' => $text,
                    'suggested_actions' => ['Ver rutas disponibles'],
                    'resource_references' => $resourceReferences,
                ], JSON_THROW_ON_ERROR),
            ]],
        ]],
    ];
}

test('chat page renders without exposing assistant configuration', function () {
    $this->withoutVite();

    configureOpenAiAssistant();

    $cyclist = User::factory()->cyclist()->create();

    $this->actingAs($cyclist)
        ->get(route('chat.index'))
        ->assertOk()
        ->assertDontSee('test-openai-key', false)
        ->assertInertia(fn (Assert $page) => $page
            ->component('chat/index')
            ->where('assistantConfigured', true)
            ->where('activeConversation', null)
            ->has('conversations', 0));
});

test('chat calls OpenAI and stores an exchange after response', function () {
    configureOpenAiAssistant();

    $cyclist = User::factory()->cyclist()->create();
    $route = createRouteForChatbot();
    $route->images()->create([
        'image_path' => 'routes/chatbot-cover.jpg',
        'description' => 'Vista editorial de la ruta de prueba.',
        'sort_order' => 0,
        'is_main' => true,
    ]);
    $route->update(['main_image_path' => 'routes/chatbot-cover.jpg']);
    $foodPoi = PointOfInterest::query()->create([
        'poi_category_id' => PoiCategory::query()->where('name', 'Comida')->sole()->id,
        'name' => 'Comedor del ciclista',
        'description' => 'Comida local para recuperar energía.',
        'latitude' => -1.5926,
        'longitude' => -79.0009,
        'active' => true,
    ]);
    $foodPoi->foodDetail()->create([
        'has_wifi' => true,
        'has_bike_parking' => true,
        'chef_recommendation' => 'Prueba el almuerzo de la casa.',
    ]);
    $route->pointsOfInterest()->attach($foodPoi->id, ['sort_order' => 1]);

    Http::fake([
        'https://api.openai.com/v1/responses' => Http::response(openAiResponse('Respuesta IA para Guaranda Go.', [
            ['kind' => 'route', 'id' => $route->id],
        ]), 200),
    ]);

    $this->actingAs($cyclist)
        ->post(route('chat.messages.store'), [
            'message' => '¿Qué debo llevar para esta ruta?',
            'route_id' => $route->id,
            'travel_context' => 'day_visitor',
            'location' => [
                'latitude' => -1.5926,
                'longitude' => -79.0009,
                'accuracy_m' => 25,
                'recorded_at' => '2026-07-01T16:45:00.000Z',
            ],
        ])
        ->assertRedirect();

    $conversation = AiConversation::query()->firstOrFail();

    expect(AiConversation::query()->count())->toBe(1)
        ->and($conversation->messages()->count())->toBe(2)
        ->and($conversation->messages()->where('role', 'user')->first()?->message)->toBe('¿Qué debo llevar para esta ruta?')
        ->and($conversation->messages()->where('role', 'assistant')->first()?->message)->toBe('Respuesta IA para Guaranda Go.')
        ->and($conversation->messages()->where('role', 'assistant')->first()?->metadata)->toMatchArray([
            'model' => 'test-model',
            'suggested_actions' => ['Ver rutas disponibles'],
            'resources' => [[
                'kind' => 'route',
                'id' => $route->id,
                'title' => $route->name,
                'description' => $route->description,
                'image_path' => 'routes/chatbot-cover.jpg',
                'image_description' => 'Vista editorial de la ruta de prueba.',
                'slug' => $route->slug,
            ]],
        ])
        ->and($conversation->context)->toHaveKey('traveler_context.kind', 'day_visitor')
        ->and($conversation->context)->not()->toHaveKey('location');

    Http::assertSent(function (Request $request) use ($route, $foodPoi): bool {
        $payload = $request->data();

        return $request->url() === 'https://api.openai.com/v1/responses'
            && Arr::get($payload, 'store') === false
            && Arr::get($payload, 'model') === 'test-model'
            && is_string(Arr::get($payload, 'input.0.content.0.text'))
            && str_contains((string) Arr::get($payload, 'input.0.content.0.text'), '¿Qué debo llevar para esta ruta?')
            && str_contains((string) Arr::get($payload, 'input.0.content.0.text'), $route->name)
            && str_contains((string) Arr::get($payload, 'input.0.content.0.text'), $foodPoi->name)
            && str_contains((string) Arr::get($payload, 'input.0.content.0.text'), 'Prueba el almuerzo de la casa.')
            && str_contains((string) Arr::get($payload, 'input.0.content.0.text'), '"latitude":-1.5926');
    });
});

test('chat sends a verified empty route context when none is selected', function () {
    configureOpenAiAssistant();

    Http::fake([
        'https://api.openai.com/v1/responses' => Http::response(openAiResponse('Hola, soy el asistente.'), 200),
    ]);

    $cyclist = User::factory()->cyclist()->create();

    $this->actingAs($cyclist)
        ->post(route('chat.messages.store'), [
            'message' => 'hola',
        ])
        ->assertRedirect();

    Http::assertSent(function (Request $request): bool {
        $input = (string) Arr::get($request->data(), 'input.0.content.0.text');

        return str_contains($input, '"route":{"id":null')
            && str_contains($input, '"location":null');
    });

    expect(AiConversation::query()->sole()->context)->not()->toHaveKey('location');
});

test('chat requires configured OpenAI before storing messages', function () {
    config(['guaranda.assistant.openai.api_key' => null, 'guaranda.assistant.openai.model' => null]);

    $cyclist = User::factory()->cyclist()->create();

    $this->actingAs($cyclist)
        ->post(route('chat.messages.store'), [
            'message' => 'Hola asistente',
        ])
        ->assertSessionHasErrors('message');

    expect(AiConversation::query()->count())->toBe(0);
    $this->assertDatabaseCount('mensajes_ia', 0);
});

test('chat returns transient assistant error when OpenAI fails without storing history', function () {
    configureOpenAiAssistant();

    Http::fake([
        'https://api.openai.com/v1/responses' => Http::response(['error' => 'internal'], 500),
    ]);

    $cyclist = User::factory()->cyclist()->create();

    $this->actingAs($cyclist)
        ->post(route('chat.messages.store'), [
            'message' => '¿Está disponible el asistente?',
        ])
        ->assertRedirect(route('chat.index'))
        ->assertSessionHas('chat_exchange');

    expect(AiConversation::query()->count())->toBe(0);
    $this->assertDatabaseCount('mensajes_ia', 0);
});

test('chat returns transient error for an incomplete OpenAI response without storing history', function () {
    configureOpenAiAssistant();

    Http::fake([
        'https://api.openai.com/v1/responses' => Http::response([
            'model' => 'test-model',
            'status' => 'in_progress',
            'output' => [],
        ], 200),
    ]);

    $cyclist = User::factory()->cyclist()->create();

    $this->actingAs($cyclist)
        ->post(route('chat.messages.store'), ['message' => '¿Qué opciones tengo?'])
        ->assertRedirect(route('chat.index'))
        ->assertSessionHas('chat_exchange');

    expect(AiConversation::query()->count())->toBe(0);
    $this->assertDatabaseCount('mensajes_ia', 0);
});

test('user can hide only own chat conversation', function () {
    $owner = User::factory()->cyclist()->create();
    $other = User::factory()->cyclist()->create();

    $ownConversation = AiConversation::query()->create([
        'user_id' => $owner->id,
        'title' => 'Propia',
        'context' => [],
        'started_at' => now(),
        'last_activity_at' => now(),
    ]);

    $otherConversation = AiConversation::query()->create([
        'user_id' => $owner->id,
        'title' => 'También propia',
        'context' => [],
        'started_at' => now(),
        'last_activity_at' => now(),
    ]);

    $this->actingAs($owner)
        ->delete(route('chat.conversations.destroy', $ownConversation))
        ->assertRedirect(route('chat.index'));

    $this->assertSoftDeleted('conversaciones_ia', [
        'id' => $ownConversation->id,
    ]);

    $this->actingAs($other)
        ->delete(route('chat.conversations.destroy', $otherConversation))
        ->assertForbidden();

    $this->assertNotSoftDeleted('conversaciones_ia', [
        'id' => $otherConversation->id,
    ]);
});

test('chat rejects another users conversation before contacting OpenAI', function () {
    configureOpenAiAssistant();
    Http::fake();

    $cyclist = User::factory()->cyclist()->create();
    $conversation = AiConversation::query()->create([
        'user_id' => User::factory()->cyclist()->create()->id,
        'title' => 'Privada',
        'context' => [],
        'started_at' => now(),
        'last_activity_at' => now(),
    ]);

    $this->actingAs($cyclist)
        ->post(route('chat.messages.store'), [
            'message' => 'No debo acceder a ese historial',
            'conversation_id' => $conversation->id,
        ])
        ->assertSessionHasErrors('conversation_id');

    Http::assertNothingSent();
});

test('chat route context must be active', function () {
    configureOpenAiAssistant();
    Http::fake();

    $cyclist = User::factory()->cyclist()->create();
    $inactiveRoute = createRouteForChatbot('Inactiva');

    $this->actingAs($cyclist)
        ->post(route('chat.messages.store'), [
            'message' => 'Dame contexto de esta ruta',
            'route_id' => $inactiveRoute->id,
        ])
        ->assertSessionHasErrors('route_id');

    Http::assertNothingSent();
    expect(AiConversation::query()->count())->toBe(0);
});

test('chat rejects an unknown travel context before contacting OpenAI', function () {
    configureOpenAiAssistant();
    Http::fake();

    $cyclist = User::factory()->cyclist()->create();

    $this->actingAs($cyclist)
        ->post(route('chat.messages.store'), [
            'message' => 'Quiero planificar mi visita',
            'travel_context' => 'unknown_context',
        ])
        ->assertSessionHasErrors('travel_context');

    Http::assertNothingSent();
});
