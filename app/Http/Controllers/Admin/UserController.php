<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ListUsersRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\Gender;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(ListUsersRequest $request): Response
    {
        $this->authorize('viewAny', User::class);

        $filters = $request->validated();
        $search = $filters['search'] ?? null;
        $roleId = isset($filters['role']) ? (int) $filters['role'] : null;
        $status = $filters['status'] ?? null;
        $perPage = (int) ($filters['per_page'] ?? 15);

        $users = User::query()
            ->withTrashed()
            ->with(['role:id,name', 'gender:id,name'])
            ->when($search, function (Builder $query, string $search): void {
                $pattern = "%{$search}%";

                $query->where(function (Builder $query) use ($pattern): void {
                    $query
                        ->whereLike('name', $pattern)
                        ->orWhereLike('last_name', $pattern)
                        ->orWhereLike('email', $pattern);
                });
            })
            ->when($roleId, fn (Builder $query, int $roleId) => $query->where('role_id', $roleId))
            ->when($status === 'active', fn (Builder $query) => $query
                ->where('active', true)
                ->whereNull('deleted_at'))
            ->when($status === 'inactive', fn (Builder $query) => $query->where(function (Builder $query): void {
                $query
                    ->where('active', false)
                    ->orWhereNotNull('deleted_at');
            }))
            ->latest('id')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (User $user): array => $this->serializeUser($user));

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'roles' => UserRole::query()->orderBy('id')->get(['id', 'name']),
            'genders' => Gender::allowedOptions(),
            'filters' => [
                'search' => $search ?? '',
                'role' => $roleId === null ? '' : (string) $roleId,
                'status' => $status ?? '',
                'per_page' => $perPage,
            ],
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $user->fill($request->validated());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        Inertia::flash('toast', ['type' => 'info', 'message' => __('Usuario actualizado.')]);

        return to_route('admin.users.index');
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        $user->forceFill(['active' => false])->save();
        $user->delete();

        Inertia::flash('toast', ['type' => 'error', 'message' => __('Usuario deshabilitado.')]);

        return to_route('admin.users.index');
    }

    public function restore(User $user): RedirectResponse
    {
        $this->authorize('restore', $user);

        if ($user->trashed()) {
            $user->restore();
        }

        $user->forceFill(['active' => true])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Usuario habilitado.')]);

        return to_route('admin.users.index');
    }

    public function sendPasswordResetLink(User $user): RedirectResponse
    {
        $this->authorize('resetPassword', $user);

        Password::sendResetLink(['email' => $user->email]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Enlace de recuperación enviado.')]);

        return to_route('admin.users.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeUser(User $user): array
    {
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
            'created_at' => $user->created_at?->toISOString(),
            'active' => $user->isActive(),
            'deleted_at' => $user->deleted_at?->toISOString(),
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
