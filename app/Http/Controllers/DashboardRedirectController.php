<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DashboardRedirectController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user?->role?->name === 'administrador') {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->route('routes.index');
    }
}
