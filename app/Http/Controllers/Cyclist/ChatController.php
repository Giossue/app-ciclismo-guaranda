<?php

namespace App\Http\Controllers\Cyclist;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cyclist\StoreChatMessageRequest;
use App\Models\AiConversation;
use App\Models\AiMessage;
use App\Models\CyclingRoute;
use App\Models\PointOfInterest;
use App\Models\User;
use App\Services\Ai\LiveTourismContext;
use App\Services\Ai\OpenAiAssistant;
use DateTimeInterface;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ChatController extends Controller
{
    public function __construct(
        private readonly OpenAiAssistant $assistant,
        private readonly LiveTourismContext $tourismContext,
    ) {}

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
            'assistantConfigured' => $this->assistant->configured(),
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
                ->whereHas('status', fn ($query) => $query->where('name', 'Activa'))
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
        if (! $this->assistant->configured()) {
            return back()->withErrors([
                'message' => 'El asistente no está configurado en el servidor.',
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
                'pointsOfInterest' => fn ($query) => $query->where('active', true)->with([
                    'category:id,name',
                    'hours:id,point_of_interest_id,weekday,opens_at,closes_at',
                    'foodDetail:point_of_interest_id,cuisine_type_id,price_range_id,is_pet_friendly,has_wifi,accepted_payment_type,has_bike_parking,chef_recommendation',
                    'foodDetail.cuisineType:id,name',
                    'foodDetail.priceRange:id,name',
                    'lodgingDetail:point_of_interest_id,lodging_type_id,allows_bikes_in_room,has_bike_wash_area,base_price',
                    'lodgingDetail.lodgingType:id,name',
                    'storeDetail:point_of_interest_id,store_type_id,sells_hydration,sells_snacks,accepted_payment_type',
                    'storeDetail.storeType:id,name',
                    'workshopDetail:point_of_interest_id,workshop_specialty_id,emergency_service,emergency_phone',
                    'workshopDetail.specialty:id,name',
                    'workshopDetail.services:id,name',
                    'healthDetail:point_of_interest_id,health_center_type_id,has_defibrillator,care_level',
                    'healthDetail.healthCenterType:id,name',
                ]),
                'incidents' => fn ($query) => $query
                    ->whereHas('status', fn ($statusQuery) => $statusQuery->where('name', 'En revisión'))
                    ->with(['type:id,name', 'status:id,name'])
                    ->latest('reported_at'),
            ])->find((int) $payload['route_id'])
            : null;

        $message = trim((string) $payload['message']);
        $location = $this->transientLocation($payload);
        $storedContext = $this->tourismContext->forMessage(
            $route,
            $message,
            $payload['travel_context'] ?? null,
        );
        $assistantContext = $storedContext;
        $assistantContext['location'] = $location;
        $conversation = $this->requestedConversation($user, $payload);
        $history = $this->conversationHistory($conversation);

        try {
            $assistantReply = $this->assistant->reply(
                message: $message,
                context: $assistantContext,
                history: $history,
                safetyIdentifier: hash_hmac('sha256', 'user-'.$user->id, (string) config('app.key')),
            );
            $assistantReply['metadata']['resources'] = $this->verifiedResources(
                $assistantReply['metadata']['resource_references'],
            );
            unset($assistantReply['metadata']['resource_references']);
            $conversation = $this->persistExchange(
                $user,
                $conversation,
                $message,
                $assistantReply['message'],
                $storedContext,
                $assistantReply['metadata'],
            );

            return to_route('chat.index', ['conversation' => $conversation->id]);
        } catch (ConnectionException $exception) {
            return $this->assistantErrorResponse(
                $message,
                'No se pudo conectar con el asistente. Revisa tu conexión e inténtalo de nuevo.',
                $exception,
            );
        } catch (Throwable $exception) {
            return $this->assistantErrorResponse(
                $message,
                'El asistente no está disponible en este momento. Inténtalo nuevamente más tarde.',
                $exception,
            );
        }
    }

    public function destroy(Request $request, AiConversation $conversation): RedirectResponse
    {
        abort_unless($conversation->user_id === $request->user()?->id, 403);

        $conversation->delete();

        return to_route('chat.index');
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{latitude: float, longitude: float, accuracy_m?: float, recorded_at?: string}|null
     */
    private function transientLocation(array $payload): ?array
    {
        $location = $payload['location'] ?? null;

        if (! is_array($location) || ! isset($location['latitude'], $location['longitude'])) {
            return null;
        }

        $transientLocation = [
            'latitude' => (float) $location['latitude'],
            'longitude' => (float) $location['longitude'],
        ];

        if (isset($location['accuracy_m']) && $location['accuracy_m'] !== '') {
            $transientLocation['accuracy_m'] = (float) $location['accuracy_m'];
        }

        if (isset($location['recorded_at']) && is_string($location['recorded_at']) && $location['recorded_at'] !== '') {
            $transientLocation['recorded_at'] = $location['recorded_at'];
        }

        return $transientLocation;
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
     * @return list<array{role: string, message: string}>
     */
    private function conversationHistory(?AiConversation $conversation): array
    {
        if ($conversation === null) {
            return [];
        }

        return $conversation->messages()
            ->select(['id', 'role', 'message', 'sent_at'])
            ->latest('sent_at')
            ->latest('id')
            ->limit(8)
            ->get()
            ->reverse()
            ->map(fn (AiMessage $message): array => [
                'role' => $message->role,
                'message' => Str::limit($message->message, 600),
            ])
            ->values()
            ->all();
    }

    /**
     * @param  array<string, mixed>  $context
     */
    private function persistExchange(User $user, ?AiConversation $conversation, string $userMessage, string $assistantMessage, array $context, array $assistantMetadata): AiConversation
    {
        return DB::transaction(function () use ($assistantMessage, $assistantMetadata, $context, $conversation, $user, $userMessage): AiConversation {
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
                'provider' => 'openai',
                'metadata' => $assistantMetadata,
                'sent_at' => $now->copy()->addSecond(),
            ]);

            return $conversation;
        });
    }

    /**
     * Rehydrates model-selected IDs from the live database. This deliberately
     * discards unknown, inactive, or stale references before they reach users.
     *
     * @param  list<array{kind: 'route'|'poi', id: int}>  $references
     * @return list<array{kind: 'route'|'poi', id: int, title: string, description: string|null, image_path: string|null, image_description: string|null, slug?: string}>
     */
    private function verifiedResources(array $references): array
    {
        $routeIds = collect($references)
            ->where('kind', 'route')
            ->pluck('id')
            ->all();
        $poiIds = collect($references)
            ->where('kind', 'poi')
            ->pluck('id')
            ->all();

        $routes = CyclingRoute::query()
            ->select(['id', 'name', 'slug', 'description', 'main_image_path'])
            ->with('images:id,route_id,image_path,description,sort_order')
            ->whereIn('id', $routeIds)
            ->whereHas('status', fn ($query) => $query->where('name', 'Activa'))
            ->get()
            ->keyBy('id');
        $pois = PointOfInterest::query()
            ->select(['id', 'name', 'description'])
            ->with('images:id,point_of_interest_id,image_path,description,sort_order')
            ->whereIn('id', $poiIds)
            ->where('active', true)
            ->get()
            ->keyBy('id');

        return collect($references)
            ->map(function (array $reference) use ($pois, $routes): ?array {
                if ($reference['kind'] === 'route') {
                    /** @var CyclingRoute|null $route */
                    $route = $routes->get($reference['id']);

                    if ($route === null) {
                        return null;
                    }

                    $image = $route->images->firstWhere('image_path', $route->main_image_path)
                        ?? $route->images->first();

                    return [
                        'kind' => 'route',
                        'id' => $route->id,
                        'title' => $route->name,
                        'description' => Str::limit($route->description, 160),
                        'image_path' => $route->main_image_path ?? $image?->image_path,
                        'image_description' => $image?->description,
                        'slug' => $route->slug,
                    ];
                }

                /** @var PointOfInterest|null $poi */
                $poi = $pois->get($reference['id']);

                if ($poi === null) {
                    return null;
                }

                $image = $poi->images->first();

                return [
                    'kind' => 'poi',
                    'id' => $poi->id,
                    'title' => $poi->name,
                    'description' => Str::limit((string) $poi->description, 160),
                    'image_path' => $image?->image_path,
                    'image_description' => $image?->description,
                ];
            })
            ->filter()
            ->values()
            ->all();
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

    private function assistantErrorResponse(string $message, string $userMessage, ?Throwable $exception = null): RedirectResponse
    {
        if ($exception !== null) {
            Log::warning('OpenAI assistant request failed', [
                'user_id' => request()->user()?->id,
                'exception' => $exception::class,
            ]);
        }

        Inertia::flash('toast', ['type' => 'error', 'message' => __('Servicio del asistente no disponible.')]);

        return to_route('chat.index')->with('chat_exchange', [
            'messages' => $this->exchangeMessages(
                $message,
                'No pude consultar el asistente: '.$userMessage,
                'openai',
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
}
