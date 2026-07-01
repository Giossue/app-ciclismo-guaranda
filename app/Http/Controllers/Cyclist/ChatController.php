<?php

namespace App\Http\Controllers\Cyclist;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cyclist\StoreChatMessageRequest;
use App\Models\AiConversation;
use App\Models\AiMessage;
use App\Models\CyclingRoute;
use App\Models\Incident;
use App\Models\PoiHour;
use App\Models\PointOfInterest;
use App\Models\User;
use DateTimeInterface;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Throwable;

class ChatController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user instanceof User, 403);

        $conversations = AiConversation::query()
            ->where('user_id', $user->id)
            ->withCount('messages')
            ->latest('last_activity_at')
            ->latest('id')
            ->limit(30)
            ->get();

        $lastMessages = AiMessage::query()
            ->whereIn('ai_conversation_id', $conversations->pluck('id'))
            ->latest('sent_at')
            ->latest('id')
            ->get()
            ->unique('ai_conversation_id')
            ->keyBy('ai_conversation_id');

        $requestedConversationId = $request->integer('conversation');
        $activeConversation = null;

        if (! $request->boolean('new')) {
            $activeConversation = AiConversation::query()
                ->with('messages')
                ->where('user_id', $user->id)
                ->when($requestedConversationId > 0, fn ($query) => $query->whereKey($requestedConversationId))
                ->when($requestedConversationId <= 0, fn ($query) => $query->latest('last_activity_at')->latest('id'))
                ->first();
        }

        return Inertia::render('chat/index', [
            'webhookConfigured' => $this->webhookUrl() !== null,
            'conversations' => $conversations
                ->map(fn (AiConversation $conversation): array => $this->serializeConversationSummary(
                    $conversation,
                    $lastMessages->get($conversation->id),
                ))
                ->values()
                ->all(),
            'activeConversation' => $this->serializeConversation($activeConversation),
            'latestMessages' => $activeConversation === null
                ? session('chat_exchange.messages', [])
                : $activeConversation->messages->map(fn (AiMessage $message): array => $this->serializeMessage($message))->values()->all(),
            'routes' => CyclingRoute::query()
                ->with(['difficulty:id,name', 'category:id,name'])
                ->whereHas('status', fn ($query) => $query->where('name', 'activa'))
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'route_difficulty_id', 'route_category_id'])
                ->map(fn (CyclingRoute $route): array => [
                    'id' => $route->id,
                    'name' => $route->name,
                    'slug' => $route->slug,
                    'difficulty' => $route->difficulty?->name,
                    'category' => $route->category?->name,
                ])
                ->values()
                ->all(),
        ]);
    }

    public function store(StoreChatMessageRequest $request): RedirectResponse
    {
        $webhookUrl = $this->webhookUrl();

        if ($webhookUrl === null) {
            return back()->withErrors([
                'message' => 'El webhook de n8n no está configurado en el servidor.',
            ]);
        }

        $user = $request->user();
        abort_unless($user instanceof User, 403);

        $payload = $request->validated();
        $route = array_key_exists('route_id', $payload) && $payload['route_id'] !== null
            ? CyclingRoute::query()->with([
                'category:id,name',
                'difficulty:id,name',
                'metrics.transportMode:id,name',
                'recommendations',
                'observations',
                'pointsOfInterest' => fn ($query) => $query->where('active', true)->with(['category:id,name', 'hours']),
                'incidents' => fn ($query) => $query
                    ->whereHas('status', fn ($statusQuery) => $statusQuery->where('name', 'en revisión'))
                    ->with(['type:id,name', 'status:id,name'])
                    ->latest('reported_at'),
            ])->find((int) $payload['route_id'])
            : null;

        $message = trim((string) $payload['message']);
        $context = $this->buildContext($user, $route);
        $conversation = $this->requestedConversation($user, $payload);
        $sessionId = 'guaranda-go-user-'.$user->id;

        try {
            $response = Http::acceptJson()
                ->asJson()
                ->timeout($this->timeoutSeconds())
                ->post($webhookUrl, [
                    'session_id' => $sessionId,
                    'user_id' => $user->id,
                    'route_id' => $route?->id,
                    'message' => $message,
                    'context' => $context,
                ]);

            if ($response->failed()) {
                throw new RuntimeException('n8n respondió con estado HTTP '.$response->status().'.');
            }

            $json = $response->json();
            $assistantText = $this->extractAssistantText($json);
            $conversation = $this->persistExchange($user, $conversation, $message, $assistantText, $context, $json);
            Inertia::flash('toast', ['type' => 'success', 'message' => __('Respuesta del asistente recibida.')]);

            return to_route('chat.index', ['conversation' => $conversation->id]);
        } catch (ConnectionException $exception) {
            return $this->assistantErrorResponse(
                $message,
                'No se pudo conectar con n8n. Revisa tu conexión e inténtalo de nuevo.',
                $exception,
            );
        } catch (Throwable $exception) {
            return $this->assistantErrorResponse(
                $message,
                'El asistente externo no está disponible en este momento. Inténtalo nuevamente más tarde.',
                $exception,
            );
        }
    }

    public function destroy(Request $request, AiConversation $conversation): RedirectResponse
    {
        abort_unless($conversation->user_id === $request->user()?->id, 403);

        $conversation->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Conversación local ocultada.')]);

        return to_route('chat.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function buildContext(User $user, ?CyclingRoute $route): array
    {
        $user->loadMissing('role:id,name');

        return [
            'app' => 'Guaranda Go',
            'language' => 'es',
            'privacy' => [
                'personal_data_minimized' => true,
                'no_email_sent' => true,
                'conversation_storage_external' => true,
            ],
            'user' => [
                'id' => $user->id,
                'age' => $user->birth_date?->age,
                'role' => $user->role?->name,
            ],
            'route' => $route === null ? null : $this->routeContext($route),
            'offline_available' => false,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function routeContext(CyclingRoute $route): array
    {
        $latestMetric = $route->metrics->sortByDesc('route_version')->first();

        return [
            'id' => $route->id,
            'name' => $route->name,
            'slug' => $route->slug,
            'difficulty' => $route->difficulty?->name,
            'category' => $route->category?->name,
            'description' => Str::limit($route->description, 700),
            'start' => $route->start_name,
            'end' => $route->end_name,
            'metric' => $latestMetric === null ? null : [
                'distance_km' => (float) $latestMetric->distance_km,
                'estimated_time_minutes' => $latestMetric->estimated_time_minutes,
                'positive_elevation_m' => (float) $latestMetric->positive_elevation_m,
                'negative_elevation_m' => (float) $latestMetric->negative_elevation_m,
                'transport_mode' => $latestMetric->transportMode?->name,
            ],
            'recommendations' => $route->recommendations->pluck('text')->take(6)->values()->all(),
            'observations' => $route->observations->pluck('text')->take(6)->values()->all(),
            'pois' => $route->pointsOfInterest->take(8)->map(fn (PointOfInterest $poi): array => [
                'name' => $poi->name,
                'category' => $poi->category?->name,
                'description' => Str::limit((string) $poi->description, 180),
                'hours' => $poi->hours->take(3)->map(fn (PoiHour $hour): array => [
                    'weekday' => $hour->weekday,
                    'opens_at' => $this->formatTimeValue($hour->getAttribute('opens_at')),
                    'closes_at' => $this->formatTimeValue($hour->getAttribute('closes_at')),
                    'description' => $hour->description,
                ])->values()->all(),
            ])->values()->all(),
            'active_incidents' => $route->incidents->take(6)->map(fn (Incident $incident): array => [
                'type' => $incident->type?->name,
                'title' => $incident->title,
                'description' => Str::limit($incident->description, 180),
            ])->values()->all(),
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function requestedConversation(User $user, array $payload): ?AiConversation
    {
        $conversationId = $payload['conversation_id'] ?? null;

        if ($conversationId === null) {
            return null;
        }

        return AiConversation::query()
            ->where('user_id', $user->id)
            ->find((int) $conversationId);
    }

    /**
     * @param  array<string, mixed>  $context
     */
    private function persistExchange(User $user, ?AiConversation $conversation, string $userMessage, string $assistantMessage, array $context, mixed $rawResponse): AiConversation
    {
        $now = now();

        if ($conversation === null) {
            $conversation = AiConversation::query()->create([
                'user_id' => $user->id,
                'title' => Str::limit($userMessage, 80),
                'context' => $context,
                'started_at' => $now,
                'last_activity_at' => $now,
            ]);
        } else {
            $conversation->forceFill([
                'context' => $context,
                'last_activity_at' => $now,
            ])->save();
        }

        $conversation->messages()->create([
            'role' => 'user',
            'message' => $userMessage,
            'provider' => null,
            'metadata' => [],
            'sent_at' => $now,
        ]);

        $conversation->messages()->create([
            'role' => 'assistant',
            'message' => $assistantMessage,
            'provider' => 'n8n',
            'metadata' => $this->assistantMetadata($rawResponse),
            'sent_at' => $now->copy()->addSecond(),
        ]);

        return $conversation;
    }

    /**
     * @return array<string, mixed>
     */
    private function assistantMetadata(mixed $rawResponse): array
    {
        if (! is_array($rawResponse)) {
            return [];
        }

        $source = Arr::isList($rawResponse) ? ($rawResponse[0] ?? []) : $rawResponse;

        if (! is_array($source)) {
            return [];
        }

        return array_filter([
            'voice_text' => Arr::get($source, 'voice_text'),
            'cards' => Arr::get($source, 'cards'),
            'suggested_actions' => Arr::get($source, 'suggested_actions'),
        ], fn (mixed $value): bool => $value !== null && $value !== []);
    }

    /**
     * @return array<string, mixed>|null
     */
    private function serializeConversation(?AiConversation $conversation): ?array
    {
        if ($conversation === null) {
            return null;
        }

        $startedAt = $conversation->getAttribute('started_at');
        $lastActivityAt = $conversation->getAttribute('last_activity_at');

        return [
            'id' => $conversation->id,
            'title' => $conversation->title,
            'started_at' => $startedAt instanceof DateTimeInterface ? $startedAt->format(DATE_ATOM) : null,
            'last_activity_at' => $lastActivityAt instanceof DateTimeInterface ? $lastActivityAt->format(DATE_ATOM) : null,
            'messages' => $conversation->messages->map(fn (AiMessage $message): array => $this->serializeMessage($message))->values()->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeConversationSummary(AiConversation $conversation, ?AiMessage $lastMessage): array
    {
        $startedAt = $conversation->getAttribute('started_at');
        $lastActivityAt = $conversation->getAttribute('last_activity_at');

        return [
            'id' => $conversation->id,
            'title' => $conversation->title,
            'started_at' => $startedAt instanceof DateTimeInterface ? $startedAt->format(DATE_ATOM) : null,
            'last_activity_at' => $lastActivityAt instanceof DateTimeInterface ? $lastActivityAt->format(DATE_ATOM) : null,
            'messages_count' => (int) $conversation->getAttribute('messages_count'),
            'last_message' => $lastMessage?->message,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeMessage(AiMessage $message): array
    {
        $sentAt = $message->getAttribute('sent_at');

        return [
            'id' => $message->id,
            'role' => $message->role,
            'message' => $message->message,
            'provider' => $message->provider,
            'sent_at' => $sentAt instanceof DateTimeInterface ? $sentAt->format(DATE_ATOM) : null,
            'metadata' => $message->metadata ?? [],
        ];
    }

    private function extractAssistantText(mixed $json): string
    {
        if (is_string($json) && trim($json) !== '') {
            return trim($json);
        }

        $candidate = null;

        if (is_array($json)) {
            $source = Arr::isList($json) ? ($json[0] ?? null) : $json;

            if (is_array($source)) {
                $candidate = Arr::get($source, 'reply')
                    ?? Arr::get($source, 'answer')
                    ?? Arr::get($source, 'message')
                    ?? Arr::get($source, 'text')
                    ?? Arr::get($source, 'response')
                    ?? Arr::get($source, 'output');
            }
        }

        if (is_string($candidate) && trim($candidate) !== '') {
            return trim($candidate);
        }

        return 'Recibí una respuesta de n8n, pero no contiene un campo de texto reconocible.';
    }

    private function assistantErrorResponse(string $message, string $userMessage, ?Throwable $exception = null): RedirectResponse
    {
        if ($exception !== null) {
            Log::warning('n8n chatbot request failed', [
                'user_id' => request()->user()?->id,
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
            ]);
        }

        Inertia::flash('toast', ['type' => 'error', 'message' => __('Servicio del asistente no disponible.')]);

        return to_route('chat.index')->with('chat_exchange', [
            'messages' => $this->exchangeMessages(
                $message,
                'No pude consultar el asistente externo: '.$userMessage,
                'n8n',
            ),
        ]);
    }

    /**
     * @return list<array{id: int, role: string, message: string, provider: string|null, sent_at: string, metadata: array<string, mixed>}>
     */
    private function exchangeMessages(string $userMessage, string $assistantMessage, ?string $provider): array
    {
        $now = now()->format(DATE_ATOM);

        return [
            [
                'id' => 1,
                'role' => 'user',
                'message' => $userMessage,
                'provider' => null,
                'sent_at' => $now,
                'metadata' => [],
            ],
            [
                'id' => 2,
                'role' => 'assistant',
                'message' => $assistantMessage,
                'provider' => $provider,
                'sent_at' => $now,
                'metadata' => ['transient' => true],
            ],
        ];
    }

    private function webhookUrl(): ?string
    {
        $url = config('guaranda.n8n.webhook_url');

        return is_string($url) && $url !== '' ? $url : null;
    }

    private function timeoutSeconds(): int
    {
        return max(1, (int) config('guaranda.n8n.timeout_seconds', 20));
    }

    private function formatTimeValue(mixed $value): ?string
    {
        if ($value instanceof DateTimeInterface) {
            return $value->format('H:i');
        }

        if (is_string($value) && $value !== '') {
            return substr($value, 0, 5);
        }

        return null;
    }
}
