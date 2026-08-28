<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Admin\BuildDashboardData;
use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(BuildDashboardData $dashboard): Response
    {
        $this->authorize('viewAny', User::class);

        // Los indicadores llegan en la primera respuesta; los bloques de abajo
        // agrupan sus consultas y se piden después, con esqueleto mientras tanto.
        return Inertia::render('admin/dashboard', [
            'overview' => $dashboard->overview(),
            'activity' => Inertia::defer(fn (): array => $dashboard->activity(), 'panels'),
            'routeStatuses' => Inertia::defer(fn (): array => $dashboard->routeStatuses(), 'panels'),
            'popularRoutes' => Inertia::defer(fn (): array => $dashboard->popularRoutes(), 'panels'),
            'attention' => Inertia::defer(fn (): array => $dashboard->attention(), 'panels'),
            'recentIncidents' => Inertia::defer(fn (): array => $dashboard->recentIncidents(), 'panels'),
        ]);
    }
}
