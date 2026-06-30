<?php

namespace App\Http\Middleware;

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
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
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

        return [
            'id' => $user->id,
            'role_id' => $user->role_id,
            'gender_id' => $user->gender_id,
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
            'gender' => $user->gender === null ? null : [
                'id' => $user->gender->id,
                'name' => $user->gender->name,
            ],
        ];
    }
}
