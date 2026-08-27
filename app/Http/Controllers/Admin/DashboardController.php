<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Admin\BuildDashboardData;
use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(BuildDashboardData $buildDashboardData): Response
    {
        $this->authorize('viewAny', User::class);

        return Inertia::render('admin/dashboard', $buildDashboardData());
    }
}
