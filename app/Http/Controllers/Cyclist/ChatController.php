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

        $conversationId = $request->integer('conversation');
        $startNew = $request->boolean('new');
        $activeConversation = $startNew ? null : ($conversationId > 0
            ? AiConversation::query()
                ->with('messages')
                ->where('user_id', $user->id)
                ->find($conversationId)
            : AiConversation::query()
                ->with('messages')
                ->where('user_id', $user->id)
                ->latest('last_activity_at')
                ->latest('id')
                ->first());

        return Inertia::render('chat/index', [
            'webhookConfigured' => $this->webhookUrl() !== null,
            'conversations' => AiConversation::query()
                ->withCount('messages')
                ->where('user_id', $user->id)
                ->latest('last_activity_at')
                ->latest('id')
                ->limit(20)
                ->get()
                ->map(fn (AiConversation $conversation): array => $this->serializeConversationSummary($conversation))
                ->values()
                ->all(),
            'activeConversation' => $activeConversation === null ? null : $this->serializeConversation($activeConversation),
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

        $conversation = $this->conversationFor($payload, $user->id, $route);
        $message = trim((string) $payload['message']);

        $userMessage = $conversation->messages()->create([
            'role' => 'user',
            'message' => $message,
            'metadata' => ['route_id' => $route?->id],
            'sent_at' => now(),
        ]);

        $context = $this->buildContext($conversation, $user, $route);
        $conversation->forceFill([
            'context' => $context,
            'last_activity_at' => now(),
        ])->save();

        try {
            $response = Http::acceptJson()
                ->asJson()
                ->timeout($this->timeoutSeconds())
                ->post($webhookUrl, [
                    'conversation_id' => $conversation->id,
                    'message_id' => $userMessage->id,
                    'message' => $message,
                    'context' => $context,
                ]);

            if ($response->failed()) {
                throw new RuntimeException('n8n respondió con estado HTTP '.$response->status().'.');
            }

            $json = $response->json();
            $assistantText = $this->extractAssistantText($json);

            $conversation->messages()->create([
                'role' => 'assistant',
                'message' => $assistantText,
                'provider' => 'n8n',
                'metadata' => [
                    'response' => $json,
                    'status' => $response->status(),
                ],
                'sent_at' => now(),
            ]);

            $conversation->forceFill(['last_activity_at' => now()])->save();
            Inertia::flash('toast', ['type' => 'success', 'message' => __('Assistant response received.')]);
        } catch (ConnectionException $exception) {
            $this->storeAssistantError(
                $conversation,
                'No se pudo conectar con n8n. Revisa tu conexión e inténtalo de nuevo.',
                $exception,
            );
        } catch (Throwable $exception) {
            $this->storeAssistantError(
                $conversation,
                'El asistente externo no está disponible en este momento. Inténtalo nuevamente más tarde.',
                $exception,
            );
        }

        return to_route('chat.index', ['conversation' => $conversation->id]);
    }

    public function destroy(Request $request, AiConversation $conversation): RedirectResponse
    {
        abort_unless($conversation->user_id === $request->user()?->id, 403);

        $conversation->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Conversation hidden.')]);

        return to_route('chat.index');
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function conversationFor(array $payload, int $userId, ?CyclingRoute $route): AiConversation
    {
        if (isset($payload['conversation_id'])) {
            /** @var AiConversation $conversation */
            $conversation = AiConversation::query()
                ->where('user_id', $userId)
                ->findOrFail((int) $payload['conversation_id']);

            return $conversation;
        }

        /** @var AiConversation $conversation */
        $conversation = AiConversation::query()->create([
            'user_id' => $userId,
            'title' => $route === null ? 'Consulta general' : 'Consulta sobre '.$route->name,
            'context' => [],
            'started_at' => now(),
            'last_activity_at' => now(),
        ]);

        return $conversation;
    }

    /**
     * @return array<string, mixed>
     */
    private function buildContext(AiConversation $conversation, User $user, ?CyclingRoute $route): array
    {
        $recentMessages = $conversation->messages()
            ->latest('sent_at')
            ->latest('id')
            ->limit(6)
            ->get()
            ->reverse()
            ->map(fn (AiMessage $message): array => [
                'role' => $message->role,
                'message' => Str::limit($message->message, 500),
            ])
            ->values()
            ->all();

        $user->loadMissing('role:id,name');

        return [
            'app' => 'Guaranda Go',
            'language' => 'es',
            'privacy' => [
                'personal_data_minimized' => true,
                'no_email_sent' => true,
            ],
            'user' => [
                'age' => $user->birth_date?->age,
                'role' => $user->role?->name,
            ],
            'route' => $route === null ? null : $this->routeContext($route),
            'recent_messages' => $recentMessages,
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

    private function storeAssistantError(AiConversation $conversation, string $userMessage, ?Throwable $exception = null): void
    {
        if ($exception !== null) {
            Log::warning('n8n chatbot request failed', [
                'conversation_id' => $conversation->id,
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
            ]);
        }

        $conversation->messages()->create([
            'role' => 'assistant',
            'message' => 'No pude consultar el asistente externo: '.$userMessage,
            'provider' => 'n8n',
            'metadata' => [
                'error' => true,
                'detail' => $exception?->getMessage() ?? $userMessage,
            ],
            'sent_at' => now(),
        ]);

        $conversation->forceFill(['last_activity_at' => now()])->save();
        Inertia::flash('toast', ['type' => 'error', 'message' => __('Assistant service unavailable.')]);
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeConversation(AiConversation $conversation): array
    {
        $conversation->loadMissing('messages');

        return [
            'id' => $conversation->id,
            'title' => $conversation->title,
            'started_at' => $this->formatDateValue($conversation->getAttribute('started_at')),
            'last_activity_at' => $this->formatDateValue($conversation->getAttribute('last_activity_at')),
            'messages' => $conversation->messages
                ->map(fn (AiMessage $message): array => $this->serializeMessage($message))
                ->values()
                ->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeConversationSummary(AiConversation $conversation): array
    {
        $lastMessage = $conversation->messages()
            ->latest('sent_at')
            ->latest('id')
            ->first();

        return [
            'id' => $conversation->id,
            'title' => $conversation->title,
            'started_at' => $this->formatDateValue($conversation->getAttribute('started_at')),
            'last_activity_at' => $this->formatDateValue($conversation->getAttribute('last_activity_at')),
            'messages_count' => (int) $conversation->getAttribute('messages_count'),
            'last_message' => $lastMessage === null ? null : Str::limit($lastMessage->message, 120),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeMessage(AiMessage $message): array
    {
        return [
            'id' => $message->id,
            'role' => $message->role,
            'message' => $message->message,
            'provider' => $message->provider,
            'metadata' => $message->metadata,
            'sent_at' => $this->formatDateValue($message->getAttribute('sent_at')),
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

    private function formatDateValue(mixed $value): ?string
    {
        if ($value instanceof DateTimeInterface) {
            return $value->format(DATE_ATOM);
        }

        if (is_string($value) && $value !== '') {
            return $value;
        }

        return null;
    }
}
