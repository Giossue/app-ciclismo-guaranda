<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CyclingRoute;
use App\Models\Incident;
use App\Models\PointOfInterest;
use App\Models\RouteRating;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $this->authorize('viewAny', User::class);

        return Inertia::render('admin/dashboard', [
            'metrics' => [
                'users' => [
                    'label' => 'Usuarios registrados',
                    'value' => User::query()->withTrashed()->count(),
                    'description' => 'Cuentas creadas en el sistema',
                ],
                'activeUsers' => [
                    'label' => 'Usuarios activos',
                    'value' => User::query()->where('active', true)->count(),
                    'description' => 'Pueden iniciar sesión y operar',
                ],
                'routes' => [
                    'label' => 'Rutas',
                    'value' => CyclingRoute::query()->withTrashed()->count(),
                    'description' => 'Rutas registradas por administración',
                ],
                'pois' => [
                    'label' => 'POIs',
                    'value' => PointOfInterest::query()->withTrashed()->count(),
                    'description' => 'Puntos de interés disponibles',
                ],
                'incidents' => [
                    'label' => 'Incidencias',
                    'value' => Incident::query()->count(),
                    'description' => 'Reportes enviados por ciclistas',
                ],
                'ratings' => [
                    'label' => 'Valoraciones',
                    'value' => RouteRating::query()->withTrashed()->count(),
                    'description' => 'Comentarios y calificaciones de rutas',
                ],
            ],
        ]);
    }
}
