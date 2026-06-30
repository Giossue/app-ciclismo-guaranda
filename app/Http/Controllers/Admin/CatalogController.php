<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CuisineType;
use App\Models\ExportFormat;
use App\Models\Gender;
use App\Models\HealthCenterType;
use App\Models\IncidentStatus;
use App\Models\IncidentType;
use App\Models\LodgingType;
use App\Models\ModerationStatus;
use App\Models\PoiCategory;
use App\Models\PriceRange;
use App\Models\RouteCategory;
use App\Models\RouteDifficulty;
use App\Models\RouteStatus;
use App\Models\RoutingEngine;
use App\Models\StoreType;
use App\Models\TrackStatus;
use App\Models\TransportMode;
use App\Models\User;
use App\Models\UserRole;
use App\Models\WorkshopService;
use App\Models\WorkshopSpecialty;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * @phpstan-type CatalogDefinition array{title: string, model: class-string<Model>, locked?: bool}
 */
class CatalogController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', User::class);

        return Inertia::render('admin/catalogs/index', [
            'catalogs' => collect($this->catalogs())
                ->map(fn (array $catalog, string $slug): array => $this->serializeCatalog($slug, $catalog))
                ->values(),
        ]);
    }

    public function store(Request $request, string $catalog): RedirectResponse
    {
        $this->authorize('viewAny', User::class);

        $definition = $this->definition($catalog);
        $modelClass = $definition['model'];
        $model = new $modelClass;
        $table = $model->getTable();
        $hasDescription = Schema::hasColumn($table, 'description');
        $hasActive = Schema::hasColumn($table, 'active');

        $validated = $request->validate($this->rules($table, $hasDescription, $hasActive));

        $record = $modelClass::query()->create($this->payload($validated, $hasDescription, $hasActive));
        $recordName = (string) $record->getAttribute('name');

        return back()->with('success', "Catálogo {$recordName} creado.");
    }

    public function update(Request $request, string $catalog, int $record): RedirectResponse
    {
        $this->authorize('viewAny', User::class);

        $definition = $this->definition($catalog);
        $modelClass = $definition['model'];
        $model = new $modelClass;
        $table = $model->getTable();
        $hasDescription = Schema::hasColumn($table, 'description');
        $hasActive = Schema::hasColumn($table, 'active');

        $validated = $request->validate($this->rules($table, $hasDescription, $hasActive, $record));

        $catalogRecord = $modelClass::query()->findOrFail($record);
        $catalogRecord->forceFill($this->payload($validated, $hasDescription, $hasActive))->save();
        $recordName = (string) $catalogRecord->getAttribute('name');

        return back()->with('success', "Catálogo {$recordName} actualizado.");
    }

    /**
     * @param  CatalogDefinition  $catalog
     * @return array<string, mixed>
     */
    private function serializeCatalog(string $slug, array $catalog): array
    {
        $modelClass = $catalog['model'];
        $model = new $modelClass;
        $table = $model->getTable();
        $hasDescription = Schema::hasColumn($table, 'description');
        $hasActive = Schema::hasColumn($table, 'active');

        $records = $modelClass::query()
            ->select(array_values(array_filter([
                'id',
                'name',
                $hasDescription ? 'description' : null,
                $hasActive ? 'active' : null,
                'created_at',
                'updated_at',
            ])))
            ->orderBy('name')
            ->get()
            ->map(function (Model $record) use ($hasDescription, $hasActive): array {
                $serialized = [
                    'id' => (int) $record->getKey(),
                    'name' => (string) $record->getAttribute('name'),
                ];

                if ($hasDescription) {
                    $serialized['description'] = $record->getAttribute('description');
                }

                if ($hasActive) {
                    $serialized['active'] = (bool) $record->getAttribute('active');
                }

                return $serialized;
            })
            ->values()
            ->all();

        return [
            'slug' => $slug,
            'title' => $catalog['title'],
            'table' => $table,
            'locked' => (bool) ($catalog['locked'] ?? false),
            'has_description' => $hasDescription,
            'has_active' => $hasActive,
            'records' => $records,
        ];
    }

    /**
     * @return CatalogDefinition
     */
    private function definition(string $catalog): array
    {
        $catalogs = $this->catalogs();

        abort_unless(array_key_exists($catalog, $catalogs), 404);

        return $catalogs[$catalog];
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(string $table, bool $hasDescription, bool $hasActive, ?int $ignoreId = null): array
    {
        return array_filter([
            'name' => ['required', 'string', 'max:255', Rule::unique($table, 'name')->ignore($ignoreId)],
            'description' => $hasDescription ? ['nullable', 'string', 'max:1000'] : null,
            'active' => $hasActive ? ['nullable', 'boolean'] : null,
        ]);
    }

    /**
     * @param  array{name: string, description?: string|null, active?: bool|null}  $validated
     * @return array<string, mixed>
     */
    private function payload(array $validated, bool $hasDescription, bool $hasActive): array
    {
        $payload = ['name' => $validated['name']];

        if ($hasDescription) {
            $payload['description'] = $validated['description'] ?? null;
        }

        if ($hasActive) {
            $payload['active'] = (bool) ($validated['active'] ?? false);
        }

        return $payload;
    }

    /**
     * @return array<string, CatalogDefinition>
     */
    private function catalogs(): array
    {
        return [
            'roles' => ['title' => 'Roles de usuario', 'model' => UserRole::class, 'locked' => true],
            'genders' => ['title' => 'Géneros', 'model' => Gender::class],
            'route-statuses' => ['title' => 'Estados de ruta', 'model' => RouteStatus::class, 'locked' => true],
            'route-difficulties' => ['title' => 'Dificultades de ruta', 'model' => RouteDifficulty::class],
            'route-categories' => ['title' => 'Categorías de ruta', 'model' => RouteCategory::class],
            'routing-engines' => ['title' => 'Motores de enrutamiento', 'model' => RoutingEngine::class],
            'transport-modes' => ['title' => 'Medios de transporte', 'model' => TransportMode::class],
            'poi-categories' => ['title' => 'Categorías POI', 'model' => PoiCategory::class, 'locked' => true],
            'price-ranges' => ['title' => 'Rangos de precio', 'model' => PriceRange::class],
            'cuisine-types' => ['title' => 'Tipos de cocina', 'model' => CuisineType::class],
            'lodging-types' => ['title' => 'Tipos de hospedaje', 'model' => LodgingType::class],
            'store-types' => ['title' => 'Tipos de tienda', 'model' => StoreType::class],
            'workshop-specialties' => ['title' => 'Especialidades de taller', 'model' => WorkshopSpecialty::class],
            'workshop-services' => ['title' => 'Servicios de taller', 'model' => WorkshopService::class],
            'health-center-types' => ['title' => 'Tipos de centro de salud', 'model' => HealthCenterType::class],
            'track-statuses' => ['title' => 'Estados de recorrido', 'model' => TrackStatus::class, 'locked' => true],
            'incident-types' => ['title' => 'Tipos de incidencia', 'model' => IncidentType::class],
            'incident-statuses' => ['title' => 'Estados de incidencia', 'model' => IncidentStatus::class, 'locked' => true],
            'moderation-statuses' => ['title' => 'Estados de moderación', 'model' => ModerationStatus::class, 'locked' => true],
            'export-formats' => ['title' => 'Formatos de exportación', 'model' => ExportFormat::class, 'locked' => true],
        ];
    }
}
