<?php

use App\Models\Gender;
use App\Models\User;
use App\Models\UserRole;
use Database\Seeders\CatalogSeeder;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
    $this->seed(CatalogSeeder::class);
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register with cyclist role and required profile fields', function () {
    $gender = Gender::query()->where('name', Gender::MASCULINE)->firstOrFail();

    $response = $this->post(route('register.store'), [
        'name' => 'Test',
        'last_name' => 'User',
        'gender_id' => $gender->id,
        'birth_date' => now()->subYears(20)->toDateString(),
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    $user = User::query()->where('email', 'test@example.com')->firstOrFail();
    $cyclistRole = UserRole::query()->where('name', 'ciclista')->firstOrFail();

    expect($user->role_id)->toBe($cyclistRole->id)
        ->and($user->gender_id)->toBe($gender->id)
        ->and($user->last_name)->toBe('User')
        ->and($user->birth_date?->toDateString())->toBe(now()->subYears(20)->toDateString())
        ->and($user->active)->toBeTrue();
});

test('registration requires complete profile fields', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors(['last_name', 'gender_id', 'birth_date']);
    $this->assertGuest();
});

test('registration rejects passwords shorter than eight characters', function () {
    $gender = Gender::query()->firstOrFail();

    $response = $this->post(route('register.store'), [
        'name' => 'Test',
        'last_name' => 'User',
        'gender_id' => $gender->id,
        'birth_date' => now()->subYears(20)->toDateString(),
        'email' => 'short-password@example.com',
        'password' => 'pass123',
        'password_confirmation' => 'pass123',
    ]);

    $response->assertSessionHasErrors('password');
    $this->assertGuest();
});

test('registration rejects unsupported gender catalog values', function () {
    $unsupportedGender = Gender::query()->create(['name' => 'otro']);

    $response = $this->post(route('register.store'), [
        'name' => 'Test',
        'last_name' => 'User',
        'gender_id' => $unsupportedGender->id,
        'birth_date' => now()->subYears(20)->toDateString(),
        'email' => 'unsupported-gender@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors('gender_id');
    $this->assertGuest();
});

test('registration rejects users younger than ten years old', function () {
    $gender = Gender::query()->firstOrFail();

    $response = $this->post(route('register.store'), [
        'name' => 'Test',
        'last_name' => 'User',
        'gender_id' => $gender->id,
        'birth_date' => now()->subYears(9)->toDateString(),
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors('birth_date');
    $this->assertGuest();
});
