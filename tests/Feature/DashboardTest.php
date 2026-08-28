<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated cyclists are redirected to their dashboard', function () {
    $user = User::factory()->cyclist()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('user.dashboard'));
});

test('cyclist can view the dashboard', function () {
    $this->withoutVite();

    $this->actingAs(User::factory()->cyclist()->create())
        ->get(route('user.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('user/dashboard'));
});

test('legacy cyclist entry points redirect to the user namespace', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/routes')
        ->assertRedirect(route('routes.index'));
});
