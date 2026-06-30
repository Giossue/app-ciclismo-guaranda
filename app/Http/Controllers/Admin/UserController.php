<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\Gender;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', User::class);

        $users = User::query()
            ->withTrashed()
            ->with(['role:id,name', 'gender:id,name'])
            ->latest('id')
            ->paginate(15)
            ->through(fn (User $user): array => $this->serializeUser($user));

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'roles' => UserRole::query()->orderBy('id')->get(['id', 'name']),
            'genders' => Gender::query()->orderBy('id')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $user->fill($request->validated());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User updated.')]);

        return to_route('admin.users.index');
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        $user->forceFill(['active' => false])->save();
        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User disabled.')]);

        return to_route('admin.users.index');
    }

    public function restore(User $user): RedirectResponse
    {
        $this->authorize('restore', $user);

        if ($user->trashed()) {
            $user->restore();
        }

        $user->forceFill(['active' => true])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User enabled.')]);

        return to_route('admin.users.index');
    }

    public function sendPasswordResetLink(User $user): RedirectResponse
    {
        $this->authorize('resetPassword', $user);

        Password::sendResetLink(['email' => $user->email]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Password reset link sent.')]);

        return to_route('admin.users.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeUser(User $user): array
    {
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
            'deleted_at' => $user->deleted_at?->toISOString(),
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
