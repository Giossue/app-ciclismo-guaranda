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
            'notifications' => [
                'unread_count' => fn (): int => $this->unreadNotificationsCount($request),
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

        if (! $user instanceof User || $user->role?->name !== 'administrador') {
            return null;
        }

        $pendingModerationId = ModerationStatus::query()->where('name', 'pendiente')->value('id');

        return [
            'incidents' => Incident::query()->whereNull('resolved_at')->count(),
            'ratings' => $pendingModerationId === null
                ? 0
                : RouteRating::query()->where('moderation_status_id', $pendingModerationId)->count(),
            'poiSuggestions' => PoiSuggestion::query()->where('status', 'pendiente')->count(),
            'poiReports' => PoiReport::query()->where('status', 'pendiente')->count(),
        ];
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
