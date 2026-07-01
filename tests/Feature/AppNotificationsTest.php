<?php

use App\Models\AppNotification;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
});

test('authenticated user can list only own app notifications', function () {
    $user = User::factory()->cyclist()->create();
    $other = User::factory()->cyclist()->create();

    AppNotification::query()->create([
        'user_id' => $user->id,
        'type' => 'incident_reviewed',
        'title' => 'Tu incidencia fue revisada',
        'message' => 'La incidencia cambió de estado.',
    ]);

    AppNotification::query()->create([
        'user_id' => $other->id,
        'type' => 'rating_reviewed',
        'title' => 'Notificación de otro usuario',
        'message' => 'No debe mostrarse.',
    ]);

    $this->actingAs($user)
        ->get(route('notifications.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('notifications/index')
            ->where('unreadCount', 1)
            ->has('notifications.data', 1)
            ->where('notifications.data.0.title', 'Tu incidencia fue revisada'));
});

test('authenticated user can filter unread notifications and mark them as read', function () {
    $user = User::factory()->cyclist()->create();

    $unread = AppNotification::query()->create([
        'user_id' => $user->id,
        'type' => 'incident_reviewed',
        'title' => 'Pendiente',
        'message' => 'Mensaje pendiente.',
    ]);

    AppNotification::query()->create([
        'user_id' => $user->id,
        'type' => 'rating_reviewed',
        'title' => 'Leída',
        'message' => 'Mensaje leído.',
        'read' => true,
        'read_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('notifications.index', ['unread' => 1]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('notifications/index')
            ->where('onlyUnread', true)
            ->where('unreadCount', 1)
            ->has('notifications.data', 1)
            ->where('notifications.data.0.id', $unread->id));

    $this->actingAs($user)
        ->patch(route('notifications.read', $unread))
        ->assertRedirect();

    $this->assertDatabaseHas('notificaciones_app', [
        'id' => $unread->id,
        'read' => true,
    ]);
});

test('authenticated user can mark all own notifications as read', function () {
    $user = User::factory()->cyclist()->create();
    $other = User::factory()->cyclist()->create();

    $ownNotification = AppNotification::query()->create([
        'user_id' => $user->id,
        'type' => 'incident_reviewed',
        'title' => 'Propia',
        'message' => 'Debe marcarse.',
    ]);

    $otherNotification = AppNotification::query()->create([
        'user_id' => $other->id,
        'type' => 'incident_reviewed',
        'title' => 'Ajena',
        'message' => 'No debe tocarse.',
    ]);

    $this->actingAs($user)
        ->patch(route('notifications.read-all'))
        ->assertRedirect();

    expect($ownNotification->fresh()?->read)->toBeTrue()
        ->and($otherNotification->fresh()?->read)->toBeFalse();
});

test('user cannot mark another user notification as read', function () {
    $user = User::factory()->cyclist()->create();
    $other = User::factory()->cyclist()->create();

    $notification = AppNotification::query()->create([
        'user_id' => $other->id,
        'type' => 'incident_reviewed',
        'title' => 'Ajena',
        'message' => 'No autorizada.',
    ]);

    $this->actingAs($user)
        ->patch(route('notifications.read', $notification))
        ->assertForbidden();

    expect($notification->fresh()?->read)->toBeFalse();
});
