<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class ModuleController extends Controller
{
    /**
     * @var array<string, array{title: string, description: string, next_phase: string}>
     */
    private const MODULES = [
        'routes' => [
            'title' => 'Rutas',
            'description' => 'Base administrativa para crear, revisar y publicar rutas ciclistas.',
            'next_phase' => 'Fase 04 — Rutas administrativas',
        ],
        'pois' => [
            'title' => 'POIs',
            'description' => 'Gestión de puntos de interés, horarios, detalles y sugerencias.',
            'next_phase' => 'Fase 06 — POIs',
        ],
        'incidents' => [
            'title' => 'Incidencias',
            'description' => 'Revisión administrativa de reportes antes de mostrarlos a ciclistas.',
            'next_phase' => 'Fase 07 — Incidencias',
        ],
        'ratings' => [
            'title' => 'Comentarios y valoraciones',
            'description' => 'Moderación de reseñas, respuestas administrativas y visibilidad pública.',
            'next_phase' => 'Fase 10 — Valoraciones, favoritos y comentarios',
        ],
        'catalogs' => [
            'title' => 'Catálogos',
            'description' => 'Consulta y mantenimiento futuro de roles, estados, categorías y tipos base.',
            'next_phase' => 'Fase transversal — Catálogos del sistema',
        ],
        'statistics' => [
            'title' => 'Estadísticas',
            'description' => 'Indicadores operativos para rutas, actividad, incidencias y usuarios.',
            'next_phase' => 'Fase 13 — Estadísticas y reportes',
        ],
        'settings' => [
            'title' => 'Configuración',
            'description' => 'Parámetros generales del sistema, seguridad operativa y preparación de despliegue.',
            'next_phase' => 'Fase transversal — Configuración administrativa',
        ],
    ];

    public function __invoke(string $module): Response
    {
        $this->authorize('viewAny', User::class);

        abort_unless(array_key_exists($module, self::MODULES), 404);

        return Inertia::render('admin/modules/show', [
            'module' => [
                'slug' => $module,
                ...self::MODULES[$module],
            ],
        ]);
    }
}
