<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use App\Models\User;
use DateTimeInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppNotificationController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        if ($request->user()?->isAdministrator()) {
            return to_route('admin.notifications.index');
        }

        return $this->renderIndex($request, 'notifications/index');
    }

    protected function renderIndex(Request $request, string $component): Response
    {
        $user = $this->notificationUser($request);

        $onlyUnread = $request->boolean('unread');

        $notifications = AppNotification::query()
            ->where('user_id', $user->id)
            ->when($onlyUnread, fn ($query) => $query->where('read', false))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (AppNotification $notification): array => $this->serializeNotification($notification));

        return Inertia::render($component, [
            'notifications' => $notifications,
            'onlyUnread' => $onlyUnread,
            'unreadCount' => AppNotification::query()
                ->where('user_id', $user->id)
                ->where('read', false)
                ->count(),
        ]);
    }

    public function markAsRead(Request $request, AppNotification $notification): RedirectResponse
    {
        abort_unless($notification->user_id === $this->notificationUser($request)->id, 403);

        if (! $notification->read) {
            $notification->forceFill([
                'read' => true,
                'read_at' => now(),
            ])->save();
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Notificación marcada como leída.')]);

        return back();
    }

    public function markAllAsRead(Request $request): RedirectResponse
    {
        $user = $this->notificationUser($request);

        AppNotification::query()
            ->where('user_id', $user->id)
            ->where('read', false)
            ->update([
                'read' => true,
                'read_at' => now(),
                'updated_at' => now(),
            ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Notificaciones marcadas como leídas.')]);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeNotification(AppNotification $notification): array
    {
        $createdAt = $notification->getAttribute('created_at');
        $readAt = $notification->getAttribute('read_at');

        return [
            'id' => $notification->id,
            'type' => $notification->type,
            'title' => $notification->title,
            'message' => $notification->message,
            'link' => $notification->link,
            'read' => $notification->read,
            'read_at' => $readAt instanceof DateTimeInterface ? $readAt->format(DATE_ATOM) : null,
            'created_at' => $createdAt instanceof DateTimeInterface ? $createdAt->format(DATE_ATOM) : null,
        ];
    }

    protected function notificationUser(Request $request): User
    {
        $user = $request->user();

        abort_unless($user instanceof User && ! $user->isAdministrator(), 403);

        return $user;
    }
}
