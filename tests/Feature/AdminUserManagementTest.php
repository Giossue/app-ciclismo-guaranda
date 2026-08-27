<?php

use App\Models\Gender;
use App\Models\User;
use App\Models\UserRole;
use Database\Seeders\CatalogSeeder;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('administrator can view the user management page', function () {
    $this->withoutVite();

    $admin = User::factory()->administrator()->create();
    User::factory()->cyclist()->create();

    $this->actingAs($admin)
        ->get(route('admin.users.index'))
        ->assertOk();
});

test('administrator can search, filter and paginate managed users', function () {
    $this->withoutVite();

    $admin = User::factory()->administrator()->create();
    $cyclist = User::factory()->cyclist()->create([
        'name' => 'Ciclista Visible',
        'email' => 'ciclista.visible@example.com',
    ]);
    User::factory()->cyclist()->create([
        'name' => 'Otro ciclista',
        'email' => 'otro.ciclista@example.com',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.users.index', [
            'search' => 'visible',
            'role' => $cyclist->role_id,
            'status' => 'active',
            'per_page' => 10,
        ]))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/users/index')
            ->where('filters.search', 'visible')
            ->where('filters.role', (string) $cyclist->role_id)
            ->where('filters.status', 'active')
            ->where('filters.per_page', 10)
            ->where('users.per_page', 10)
            ->has('users.data', 1)
            ->where('users.data.0.id', $cyclist->id)
            ->where('users.data.0.created_at', fn ($value) => is_string($value)));
});

test('cyclist can not view the user management page', function () {
    $cyclist = User::factory()->cyclist()->create();

    $this->actingAs($cyclist)
        ->get(route('admin.users.index'))
        ->assertForbidden();
});

test('administrator can update another user profile and role', function () {
    $admin = User::factory()->administrator()->create();
    $user = User::factory()->cyclist()->create();
    $adminRole = UserRole::query()->where('name', 'administrador')->firstOrFail();
    $gender = Gender::query()->where('name', Gender::FEMININE)->firstOrFail();

    $this->actingAs($admin)
        ->patch(route('admin.users.update', $user), [
            'role_id' => $adminRole->id,
            'gender_id' => $gender->id,
            'name' => 'Nuevo',
            'last_name' => 'Administrador',
            'birth_date' => now()->subYears(28)->toDateString(),
            'email' => 'nuevo-admin@example.com',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.users.index'));

    $user->refresh();

    expect($user->role_id)->toBe($adminRole->id)
        ->and($user->gender_id)->toBe($gender->id)
        ->and($user->name)->toBe('Nuevo')
        ->and($user->last_name)->toBe('Administrador')
        ->and($user->email)->toBe('nuevo-admin@example.com')
        ->and($user->email_verified_at)->toBeNull();
});

test('administrator can disable another user without physical deletion', function () {
    $admin = User::factory()->administrator()->create();
    $user = User::factory()->cyclist()->create();

    $this->actingAs($admin)
        ->delete(route('admin.users.destroy', $user))
        ->assertRedirect(route('admin.users.index'));

    $disabledUser = User::withTrashed()->find($user->id);

    expect($disabledUser?->trashed())->toBeTrue()
        ->and($disabledUser?->active)->toBeFalse();

    $this->post(route('logout'));

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
});

test('administrator can reactivate a disabled user', function () {
    $admin = User::factory()->administrator()->create();
    $user = User::factory()->cyclist()->create();

    $user->forceFill(['active' => false])->save();
    $user->delete();

    $this->actingAs($admin)
        ->patch(route('admin.users.restore', $user->id))
        ->assertRedirect(route('admin.users.index'));

    $user->refresh();

    expect($user->trashed())->toBeFalse()
        ->and($user->active)->toBeTrue();
});

test('administrator can send password reset link to another user', function () {
    Notification::fake();

    $admin = User::factory()->administrator()->create();
    $user = User::factory()->cyclist()->create();

    $this->actingAs($admin)
        ->post(route('admin.users.password-reset', $user))
        ->assertRedirect(route('admin.users.index'));

    Notification::assertSentTo($user, ResetPassword::class);
});

test('administrator can not disable their own account from user management', function () {
    $admin = User::factory()->administrator()->create();

    $this->actingAs($admin)
        ->delete(route('admin.users.destroy', $admin))
        ->assertForbidden();

    expect($admin->fresh()?->active)->toBeTrue();
});
