<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\AppNotificationController;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Response;

class NotificationController extends AppNotificationController
{
    public function index(Request $request): Response
    {
        return $this->renderIndex($request, 'admin/notifications/index');
    }

    protected function notificationUser(Request $request): User
    {
        $user = $request->user();

        abort_unless($user instanceof User && $user->isAdministrator(), 403);

        return $user;
    }
}
