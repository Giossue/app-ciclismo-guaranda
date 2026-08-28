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
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * @phpstan-type CatalogDefinition array{title: string, model: class-string<Model>, domain: string, locked?: bool, allowed_names?: list<string>}
 * @phpstan-type DomainDefinition array{title: string, description: string}
 */
class CatalogController extends Controller
{
    /**
     * Columnas por tabla, cacheadas durante la petición: el formulario de alta
     * necesita saber qué campos tiene cada catálogo, no solo el seleccionado.
     *
     * @var array<string, array<mixed>>
     */
    private array $tableColumns = [];

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $catalogs = $this->catalogs();
        $domains = $this->domains();

        $filters = $request->validate([
            'domain' => ['nullable', 'string', Rule::in(array_keys($domains))],
            'catalog' => ['nullable', 'string', Rule::in(array_keys($catalogs))],
            'search' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
            'per_page' => ['nullable', 'integer', Rule::in([10, 15, 25, 50])],
        ]);

        $requestedDomain = $filters['domain'] ?? null;
        $requestedCatalog = $filters['catalog'] ?? null;

        if ($requestedCatalog !== null) {
            $slug = $requestedCatalog;
            $definition = $catalogs[$slug];
            $domain = $definition['domain'];

            if ($requestedDomain !== null && $requestedDomain !== $domain) {
                throw ValidationException::withMessages([
                    'catalog' => ['El catálogo seleccionado no pertenece al segmento indicado.'],
                ]);
            }
        } else {
            $domain = $requestedDomain ?? (string) array_key_first($domains);
            $slug = $this->firstCatalogForDomain($catalogs, $domain);
            $definition = $catalogs[$slug];
        }

        $search = $filters['search'] ?? null;
        $status = $filters['status'] ?? null;
        $perPage = (int) ($filters['per_page'] ?? 15);

        $meta = $this->catalogMeta($slug, $definition);

        $records = $this->recordsQuery($definition, $meta)
            ->when($search, function (Builder $query, string $search) use ($meta): void {
                $pattern = "%{$search}%";

                $query->where(function (Builder $query) use ($pattern, $meta): void {
                    $query->whereLike('name', $pattern);

                    if ($meta['has_description']) {
                        $query->orWhereLike('description', $pattern);
                    }
                });
            })
            ->when($meta['has_active'] && $status === 'active', fn (Builder $query) => $query->where('active', true))
            ->when($meta['has_active'] && $status === 'inactive', fn (Builder $query) => $query->where('active', false))
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Model $record): array => $this->serializeRecord($record, $meta));

        return Inertia::render('admin/catalogs/index', [
            'domains' => $this->domainSummaries($catalogs, $domains),
            'domain' => [
                'slug' => $domain,
                'title' => $domains[$domain]['title'],
                'description' => $domains[$domain]['description'],
            ],
            'catalog' => $meta,
            'records' => $records,
            'filters' => [
                'domain' => $domain,
                'catalog' => $slug,
                'search' => $search ?? '',
                'status' => $meta['has_active'] ? ($status ?? '') : '',
                'per_page' => $perPage,
            ],
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
        $allowedNames = $definition['allowed_names'] ?? null;

        $validated = $request->validate($this->rules($table, $hasDescription, $hasActive, allowedNames: $allowedNames));

        $record = $modelClass::query()->create($this->payload($validated, $hasDescription, $hasActive));
        $recordName = (string) $record->getAttribute('name');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Registro :name creado.', ['name' => $recordName])]);

        return back();
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
        $allowedNames = $definition['allowed_names'] ?? null;

        $validated = $request->validate($this->rules($table, $hasDescription, $hasActive, $record, $allowedNames));

        $catalogRecord = $modelClass::query()->findOrFail($record);
        $catalogRecord->forceFill($this->payload($validated, $hasDescription, $hasActive))->save();
        $recordName = (string) $catalogRecord->getAttribute('name');

        Inertia::flash('toast', ['type' => 'info', 'message' => __('Registro :name actualizado.', ['name' => $recordName])]);

        return back();
    }

    /**
     * @param  array<string, CatalogDefinition>  $catalogs
     * @param  array<string, DomainDefinition>  $domains
     * @return list<array{slug: string, title: string, description: string, catalogs: list<array{slug: string, title: string, locked: bool}>}>
     */
    private function domainSummaries(array $catalogs, array $domains): array
    {
        $summaries = [];

        foreach ($domains as $domainSlug => $domain) {
            $domainCatalogs = [];

            foreach ($catalogs as $catalogSlug => $catalog) {
                if ($catalog['domain'] !== $domainSlug) {
                    continue;
                }

                $meta = $this->catalogMeta($catalogSlug, $catalog);

                $domainCatalogs[] = [
                    'slug' => $catalogSlug,
                    'title' => $meta['title'],
                    'locked' => $meta['locked'],
                    'has_description' => $meta['has_description'],
                    'has_active' => $meta['has_active'],
                ];
            }

            $summaries[] = [
                'slug' => $domainSlug,
                'title' => $domain['title'],
                'description' => $domain['description'],
                'catalogs' => $domainCatalogs,
            ];
        }

        return $summaries;
    }

    /**
     * @param  CatalogDefinition  $catalog
     * @return array{slug: string, title: string, domain: string, locked: bool, has_description: bool, has_active: bool}
     */
    private function catalogMeta(string $slug, array $catalog): array
    {
        $modelClass = $catalog['model'];
        $table = (new $modelClass)->getTable();
        $columns = $this->tableColumns($table);

        return [
            'slug' => $slug,
            'title' => $catalog['title'],
            'domain' => $catalog['domain'],
            'locked' => (bool) ($catalog['locked'] ?? false),
            'has_description' => in_array('description', $columns, true),
            'has_active' => in_array('active', $columns, true),
        ];
    }

    /**
     * @return array<mixed>
     */
    private function tableColumns(string $table): array
    {
        return $this->tableColumns[$table] ??= Schema::getColumnListing($table);
    }

    /**
     * @param  CatalogDefinition  $catalog
     * @param  array{slug: string, title: string, domain: string, locked: bool, has_description: bool, has_active: bool}  $meta
     * @return Builder<Model>
     */
    private function recordsQuery(array $catalog, array $meta): Builder
    {
        $modelClass = $catalog['model'];
        $allowedNames = $catalog['allowed_names'] ?? null;

        $query = $modelClass::query()
            ->select(array_values(array_filter([
                'id',
                'name',
                $meta['has_description'] ? 'description' : null,
                $meta['has_active'] ? 'active' : null,
            ])));

        if ($allowedNames !== null) {
            $query->whereIn('name', $allowedNames);
        }

        return $query;
    }

    /**
     * @param  array{slug: string, title: string, domain: string, locked: bool, has_description: bool, has_active: bool}  $meta
     * @return array<string, mixed>
     */
    private function serializeRecord(Model $record, array $meta): array
    {
        $serialized = [
            'id' => (int) $record->getKey(),
            'name' => (string) $record->getAttribute('name'),
        ];

        if ($meta['has_description']) {
            $serialized['description'] = $record->getAttribute('description');
        }

        if ($meta['has_active']) {
            $serialized['active'] = (bool) $record->getAttribute('active');
        }

        return $serialized;
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
     * @param  list<string>|null  $allowedNames
     * @return array<string, mixed>
     */
    private function rules(string $table, bool $hasDescription, bool $hasActive, ?int $ignoreId = null, ?array $allowedNames = null): array
    {
        $nameRules = ['required', 'string', 'max:255', Rule::unique($table, 'name')->ignore($ignoreId)];

        if ($allowedNames !== null) {
            $nameRules[] = Rule::in($allowedNames);
        }

        return array_filter([
            'name' => $nameRules,
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
            'roles' => ['title' => 'Roles de usuario', 'model' => UserRole::class, 'domain' => 'users', 'locked' => true],
            'genders' => ['title' => 'Géneros', 'model' => Gender::class, 'domain' => 'users', 'locked' => true, 'allowed_names' => Gender::ALLOWED_NAMES],
            'route-statuses' => ['title' => 'Estados de ruta', 'model' => RouteStatus::class, 'domain' => 'routes', 'locked' => true],
            'route-difficulties' => ['title' => 'Dificultades de ruta', 'model' => RouteDifficulty::class, 'domain' => 'routes'],
            'route-categories' => ['title' => 'Categorías de ruta', 'model' => RouteCategory::class, 'domain' => 'routes'],
            'routing-engines' => ['title' => 'Motores de enrutamiento', 'model' => RoutingEngine::class, 'domain' => 'routes'],
            'transport-modes' => ['title' => 'Medios de transporte', 'model' => TransportMode::class, 'domain' => 'routes'],
            'poi-categories' => ['title' => 'Categorías POI', 'model' => PoiCategory::class, 'domain' => 'pois', 'locked' => true],
            'price-ranges' => ['title' => 'Rangos de precio', 'model' => PriceRange::class, 'domain' => 'pois'],
            'cuisine-types' => ['title' => 'Tipos de cocina', 'model' => CuisineType::class, 'domain' => 'pois'],
            'lodging-types' => ['title' => 'Tipos de hospedaje', 'model' => LodgingType::class, 'domain' => 'pois'],
            'store-types' => ['title' => 'Tipos de tienda', 'model' => StoreType::class, 'domain' => 'pois'],
            'workshop-specialties' => ['title' => 'Especialidades de taller', 'model' => WorkshopSpecialty::class, 'domain' => 'pois'],
            'workshop-services' => ['title' => 'Servicios de taller', 'model' => WorkshopService::class, 'domain' => 'pois'],
            'health-center-types' => ['title' => 'Tipos de centro de salud', 'model' => HealthCenterType::class, 'domain' => 'pois'],
            'track-statuses' => ['title' => 'Estados de recorrido', 'model' => TrackStatus::class, 'domain' => 'tracks', 'locked' => true],
            'incident-types' => ['title' => 'Tipos de incidencia', 'model' => IncidentType::class, 'domain' => 'incidents'],
            'incident-statuses' => ['title' => 'Estados de incidencia', 'model' => IncidentStatus::class, 'domain' => 'incidents', 'locked' => true],
            'moderation-statuses' => ['title' => 'Estados de moderación', 'model' => ModerationStatus::class, 'domain' => 'system', 'locked' => true],
            'export-formats' => ['title' => 'Formatos de exportación', 'model' => ExportFormat::class, 'domain' => 'system', 'locked' => true],
        ];
    }

    /**
     * @return array<string, DomainDefinition>
     */
    private function domains(): array
    {
        return [
            'users' => ['title' => 'Usuarios', 'description' => 'Roles y datos de perfil.'],
            'routes' => ['title' => 'Rutas', 'description' => 'Estados, clasificación y planificación.'],
            'pois' => ['title' => 'POIs', 'description' => 'Tipos y servicios disponibles en ruta.'],
            'tracks' => ['title' => 'Recorridos', 'description' => 'Estados del registro de actividad.'],
            'incidents' => ['title' => 'Incidencias', 'description' => 'Tipos y flujo de atención.'],
            'system' => ['title' => 'Sistema', 'description' => 'Moderación y formatos operativos.'],
        ];
    }

    /**
     * @param  array<string, CatalogDefinition>  $catalogs
     */
    private function firstCatalogForDomain(array $catalogs, string $domain): string
    {
        foreach ($catalogs as $slug => $catalog) {
            if ($catalog['domain'] === $domain) {
                return $slug;
            }
        }

        throw new \LogicException("No hay catálogos configurados para el segmento [{$domain}].");
    }
}
