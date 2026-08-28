<?php

use App\Models\AppNotification;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
});

test('bell panel loads the latest notifications on demand', function () {
    $user = User::factory()->cyclist()->create();

    AppNotification::query()->create([
        'user_id' => $user->id,
        'type' => 'incident_reviewed',
        'title' => 'Tu incidencia fue revisada',
        'message' => 'La incidencia cambió de estado.',
        'link' => '/user/routes/ruta-de-prueba',
    ]);

    // Sin pedirla, la lista no viaja: es un prop opcional.
    $this->actingAs($user)
        ->get(route('notifications.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('notificationCenter.unread_count', 1)
            ->missing('notificationCenter.latest'));

    $this->actingAs($user)
        ->withHeaders([
            'X-Inertia' => 'true',
            'X-Inertia-Version' => Inertia::getVersion(),
            'X-Inertia-Partial-Component' => 'notifications/index',
            'X-Inertia-Partial-Data' => 'notificationCenter',
        ])
        ->get(route('notifications.index'))
        ->assertOk()
        ->assertJsonCount(1, 'props.notificationCenter.latest')
        ->assertJsonPath('props.notificationCenter.latest.0.link', '/user/routes/ruta-de-prueba');
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

test('user with a legacy non-admin role can access own notifications', function () {
    $legacyRoleId = DB::table('roles_usuario')->insertGetId([
        'name' => 'ciclista',
        'description' => 'Rol heredado.',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $user = User::factory()->create(['role_id' => $legacyRoleId]);

    $this->actingAs($user)
        ->get(route('notifications.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('notifications/index'));
});

test('administrator is redirected to the separated admin notifications module', function () {
    $administrator = User::factory()->administrator()->create();

    $this->actingAs($administrator)
        ->get(route('notifications.index'))
        ->assertRedirect(route('admin.notifications.index'));

    $this->actingAs($administrator)
        ->get(route('admin.notifications.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/notifications/index')
            ->where('auth.user.role.name', 'Administrador'));
});

test('administrator can list and mark only own notifications in the admin module', function () {
    $administrator = User::factory()->administrator()->create();
    $otherAdministrator = User::factory()->administrator()->create();

    $ownNotification = AppNotification::query()->create([
        'user_id' => $administrator->id,
        'type' => 'incident_reported',
        'title' => 'Incidencia pendiente',
        'message' => 'Requiere revisión.',
    ]);
    $otherNotification = AppNotification::query()->create([
        'user_id' => $otherAdministrator->id,
        'type' => 'incident_reported',
        'title' => 'Incidencia ajena',
        'message' => 'No debe aparecer.',
    ]);

    $this->actingAs($administrator)
        ->get(route('admin.notifications.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/notifications/index')
            ->has('notifications.data', 1)
            ->where('notifications.data.0.id', $ownNotification->id));

    $this->actingAs($administrator)
        ->patch(route('admin.notifications.read', $otherNotification))
        ->assertForbidden();

    $this->actingAs($administrator)
        ->patch(route('admin.notifications.read', $ownNotification))
        ->assertRedirect();

    expect($ownNotification->fresh()?->read)->toBeTrue()
        ->and($otherNotification->fresh()?->read)->toBeFalse();
});

test('cyclist can not access the admin notifications module', function () {
    $cyclist = User::factory()->cyclist()->create();

    $this->actingAs($cyclist)
        ->get(route('admin.notifications.index'))
        ->assertForbidden();
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
