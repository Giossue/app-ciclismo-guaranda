<?php

use App\Models\AiConversation;
use App\Models\AiMessage;
use App\Models\CyclingRoute;
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
});

function createRouteForChatbotN8n(string $statusName = 'activa'): CyclingRoute
{
    static $sequence = 0;

    $sequence++;
    $admin = User::factory()->administrator()->create();
    $status = RouteStatus::query()->where('name', $statusName)->firstOrFail();
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

test('chat page renders without exposing configured webhook url', function () {
    $this->withoutVite();

    config(['guaranda.n8n.webhook_url' => 'https://n8n.example/webhook/secret-token']);

    $cyclist = User::factory()->cyclist()->create();

    $this->actingAs($cyclist)
        ->get(route('chat.index'))
        ->assertOk()
        ->assertDontSee('https://n8n.example/webhook/secret-token', false)
        ->assertInertia(fn (Assert $page) => $page
            ->component('chat/index')
            ->where('webhookConfigured', true)
            ->where('activeConversation', null)
            ->has('conversations', 0));
});

test('chat stores conversation and assistant response from n8n', function () {
    config(['guaranda.n8n.webhook_url' => 'https://n8n.example/webhook/secret-token']);

    Http::fake([
        'https://n8n.example/*' => Http::response(['reply' => 'Respuesta IA para Guaranda Go.'], 200),
    ]);

    $cyclist = User::factory()->cyclist()->create();
    $route = createRouteForChatbotN8n();

    $this->actingAs($cyclist)
        ->post(route('chat.messages.store'), [
            'message' => '¿Qué debo llevar para esta ruta?',
            'route_id' => $route->id,
        ])
        ->assertRedirect();

    $conversation = AiConversation::query()->where('user_id', $cyclist->id)->firstOrFail();

    expect(AiMessage::query()->where('ai_conversation_id', $conversation->id)->count())->toBe(2);

    $this->assertDatabaseHas('mensajes_ia', [
        'ai_conversation_id' => $conversation->id,
        'role' => 'user',
        'message' => '¿Qué debo llevar para esta ruta?',
    ]);

    $this->assertDatabaseHas('mensajes_ia', [
        'ai_conversation_id' => $conversation->id,
        'role' => 'assistant',
        'provider' => 'n8n',
        'message' => 'Respuesta IA para Guaranda Go.',
    ]);

    Http::assertSent(function (Request $request) use ($route): bool {
        $payload = $request->data();

        return $request->url() === 'https://n8n.example/webhook/secret-token'
            && Arr::get($payload, 'message') === '¿Qué debo llevar para esta ruta?'
            && Arr::get($payload, 'context.app') === 'Guaranda Go'
            && Arr::get($payload, 'context.route.id') === $route->id
            && Arr::get($payload, 'context.privacy.no_email_sent') === true
            && ! Arr::has($payload, 'context.user.email')
            && ! Arr::has($payload, 'context.user.name');
    });
});

test('chat requires configured webhook before storing messages', function () {
    config(['guaranda.n8n.webhook_url' => null]);

    $cyclist = User::factory()->cyclist()->create();

    $this->actingAs($cyclist)
        ->post(route('chat.messages.store'), [
            'message' => 'Hola asistente',
        ])
        ->assertSessionHasErrors('message');

    expect(AiConversation::query()->count())->toBe(0)
        ->and(AiMessage::query()->count())->toBe(0);
});

test('chat stores generic assistant error when webhook fails', function () {
    config(['guaranda.n8n.webhook_url' => 'https://n8n.example/webhook/secret-token']);

    Http::fake([
        'https://n8n.example/*' => Http::response(['error' => 'internal'], 500),
    ]);

    $cyclist = User::factory()->cyclist()->create();

    $this->actingAs($cyclist)
        ->post(route('chat.messages.store'), [
            'message' => '¿Está disponible el asistente?',
        ])
        ->assertRedirect();

    $conversation = AiConversation::query()->where('user_id', $cyclist->id)->firstOrFail();
    $assistantMessage = AiMessage::query()
        ->where('ai_conversation_id', $conversation->id)
        ->where('role', 'assistant')
        ->firstOrFail();

    expect($assistantMessage->message)
        ->toContain('No pude consultar el asistente externo')
        ->toContain('El asistente externo no está disponible')
        ->not->toContain('HTTP 500')
        ->and($assistantMessage->metadata['error'])->toBeTrue()
        ->and($assistantMessage->metadata['detail'])->toContain('HTTP 500');
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

test('chat route context must be active', function () {
    config(['guaranda.n8n.webhook_url' => 'https://n8n.example/webhook/secret-token']);
    Http::fake();

    $cyclist = User::factory()->cyclist()->create();
    $inactiveRoute = createRouteForChatbotN8n('inactiva');

    $this->actingAs($cyclist)
        ->post(route('chat.messages.store'), [
            'message' => 'Dame contexto de esta ruta',
            'route_id' => $inactiveRoute->id,
        ])
        ->assertSessionHasErrors('route_id');

    Http::assertNothingSent();
    expect(AiConversation::query()->count())->toBe(0);
});
