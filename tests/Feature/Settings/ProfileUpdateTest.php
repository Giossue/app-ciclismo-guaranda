<?php

use App\Models\Gender;
use App\Models\User;
use Database\Seeders\CatalogSeeder;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('profile.edit'));

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create();
    $gender = Gender::query()->where('name', 'femenino')->firstOrFail();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test',
            'last_name' => 'User',
            'gender_id' => $gender->id,
            'birth_date' => now()->subYears(25)->toDateString(),
            'email' => 'test@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->name)->toBe('Test');
    expect($user->last_name)->toBe('User');
    expect($user->gender_id)->toBe($gender->id);
    expect($user->birth_date?->toDateString())->toBe(now()->subYears(25)->toDateString());
    expect($user->email)->toBe('test@example.com');
    expect($user->email_verified_at)->toBeNull();
});

test('profile update requires minimum age', function () {
    $user = User::factory()->create();
    $gender = Gender::query()->firstOrFail();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test',
            'last_name' => 'User',
            'gender_id' => $gender->id,
            'birth_date' => now()->subYears(9)->toDateString(),
            'email' => 'test@example.com',
        ]);

    $response->assertSessionHasErrors('birth_date');
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();
    $gender = Gender::query()->where('name', 'masculino')->firstOrFail();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test',
            'last_name' => 'User',
            'gender_id' => $gender->id,
            'birth_date' => now()->subYears(30)->toDateString(),
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('user can disable their account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete(route('profile.destroy'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertGuest();

    $disabledUser = User::withTrashed()->find($user->id);

    expect($disabledUser?->trashed())->toBeTrue();
    expect($disabledUser?->active)->toBeFalse();
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->delete(route('profile.destroy'), [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('profile.edit'));

    expect($user->fresh())->not->toBeNull();
});
