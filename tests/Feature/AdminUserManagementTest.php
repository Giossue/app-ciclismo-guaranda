<?php

use App\Models\Gender;
use App\Models\User;
use App\Models\UserRole;
use Database\Seeders\CatalogSeeder;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;

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
    $gender = Gender::query()->where('name', 'otro')->firstOrFail();

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
