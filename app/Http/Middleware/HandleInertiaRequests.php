<?php

namespace App\Http\Middleware;

use App\Models\AppNotification;
use App\Models\Incident;
use App\Models\ModerationStatus;
use App\Models\PoiReport;
use App\Models\PoiSuggestion;
use App\Models\RouteRating;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $this->serializeUser($request->user()),
            ],
            // Nombre propio: la pantalla de notificaciones publica su propio
            // prop `notifications` con el listado paginado y lo sombrearía.
            'notificationCenter' => [
                'unread_count' => fn (): int => $this->unreadNotificationsCount($request),
                // Opcional: la lista solo viaja cuando el panel la pide.
                'latest' => Inertia::optional(fn (): array => $this->latestNotifications($request)),
            ],
            'adminCounters' => fn (): ?array => $this->adminCounters($request),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    /**
     * Pendientes por módulo para las insignias del sidebar. Solo se calculan
     * para administradores: el resto de usuarios no ve esos módulos.
     *
     * @return array<string, int>|null
     */
    private function adminCounters(Request $request): ?array
    {
        $user = $request->user();

        if (! $user instanceof User || $user->role?->name !== 'Administrador') {
            return null;
        }

        $pendingModerationId = ModerationStatus::query()->where('name', 'Pendiente')->value('id');

        return [
            'incidents' => Incident::query()->whereNull('resolved_at')->count(),
            'ratings' => $pendingModerationId === null
                ? 0
                : RouteRating::query()->where('moderation_status_id', $pendingModerationId)->count(),
            'poiSuggestions' => PoiSuggestion::query()->where('status', 'Pendiente')->count(),
            'poiReports' => PoiReport::query()->where('status', 'Pendiente')->count(),
        ];
    }

    /**
     * Últimas notificaciones para el panel de la campana.
     *
     * @return array<int, array<string, mixed>>
     */
    private function latestNotifications(Request $request): array
    {
        $user = $request->user();

        if (! $user instanceof User) {
            return [];
        }

        return AppNotification::query()
            ->where('user_id', $user->id)
            ->latest('created_at')
            ->latest('id')
            ->limit(8)
            ->get(['id', 'type', 'title', 'message', 'link', 'read', 'created_at'])
            ->map(fn (AppNotification $notification): array => [
                'id' => $notification->id,
                'type' => $notification->type,
                'title' => $notification->title,
                'message' => $notification->message,
                'link' => $notification->link,
                'read' => (bool) $notification->read,
                'created_at' => $notification->created_at?->toAtomString(),
            ])
            ->all();
    }

    private function unreadNotificationsCount(Request $request): int
    {
        $user = $request->user();

        if (! $user instanceof User) {
            return 0;
        }

        return AppNotification::query()
            ->where('user_id', $user->id)
            ->where('read', false)
            ->count();
    }

    /**
     * @return array<string, mixed>|null
     */
    private function serializeUser(?User $user): ?array
    {
        if ($user === null) {
            return null;
        }

        $user->loadMissing(['role:id,name', 'gender:id,name']);

        $gender = $user->gender?->isAllowed() ? $user->gender : null;

        return [
            'id' => $user->id,
            'role_id' => $user->role_id,
            'gender_id' => $gender?->id,
            'name' => $user->name,
            'last_name' => $user->last_name,
            'birth_date' => $user->birth_date?->toDateString(),
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at?->toISOString(),
            'active' => $user->isActive(),
            'created_at' => $user->created_at?->toISOString(),
            'updated_at' => $user->updated_at?->toISOString(),
            'role' => $user->role === null ? null : [
                'id' => $user->role->id,
                'name' => $user->role->name,
            ],
            'gender' => $gender === null ? null : [
                'id' => $gender->id,
                'name' => $gender->displayName(),
            ],
        ];
    }
}
