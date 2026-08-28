<?php

namespace App\Services\Ai;

use App\Models\CyclingRoute;
use App\Models\Incident;
use App\Models\PointOfInterest;
use App\Models\RouteMetric;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class KnowledgeDocumentBuilder
{
    /**
     * Builds the future vector projection from the public source of truth.
     * It deliberately does not persist, embed, or expose private data.
     *
     * @return Collection<int, array{document_key: string, source_type: 'route'|'poi'|'incident', source_id: int, section: string, language: 'es', content: string, metadata: array<string, mixed>, checksum: string}>
     */
    public function all(): Collection
    {
        return $this->activeRoutes()
            ->flatMap(fn (CyclingRoute $route): array => $this->routeDocuments($route))
            ->merge($this->activePois()->map(fn (PointOfInterest $poi): array => $this->poiDocument($poi)))
            ->merge($this->visibleIncidents()->map(fn (Incident $incident): array => $this->incidentDocument($incident)))
            ->values();
    }

    /**
     * @return Collection<int, CyclingRoute>
     */
    private function activeRoutes(): Collection
    {
        return CyclingRoute::query()
            ->select([
                'id',
                'route_difficulty_id',
                'route_category_id',
                'name',
                'description',
                'start_name',
                'end_name',
                'road_type',
                'required_experience',
            ])
            ->with([
                'category:id,name',
                'difficulty:id,name',
                'metrics:id,route_id,route_version,distance_km,estimated_time_minutes,positive_elevation_m,negative_elevation_m,transport_mode_id',
                'metrics.transportMode:id,name',
                'recommendations:id,route_id,text',
                'observations:id,route_id,text',
                'images:id,route_id,description,sort_order',
                'pointsOfInterest' => fn ($query) => $query
                    ->select(['puntos_interes.id', 'poi_category_id', 'name', 'description', 'observations', 'address', 'active'])
                    ->where('active', true)
                    ->with($this->poiRelations()),
            ])
            ->whereHas('status', fn ($query) => $query->where('name', 'Activa'))
            ->orderBy('id')
            ->get();
    }

    /**
     * @return Collection<int, PointOfInterest>
     */
    private function activePois(): Collection
    {
        return PointOfInterest::query()
            ->select(['id', 'poi_category_id', 'name', 'description', 'observations', 'address', 'active'])
            ->where('active', true)
            ->with([
                ...$this->poiRelations(),
                'routes' => fn ($query) => $query
                    ->select(['rutas.id', 'name'])
                    ->whereHas('status', fn ($statusQuery) => $statusQuery->where('name', 'Activa')),
            ])
            ->orderBy('id')
            ->get();
    }

    /**
     * @return Collection<int, Incident>
     */
    private function visibleIncidents(): Collection
    {
        return Incident::query()
            ->select(['id', 'route_id', 'incident_type_id', 'description', 'reported_at'])
            ->with(['route:id,name', 'type:id,name'])
            ->whereHas('route.status', fn ($query) => $query->where('name', 'Activa'))
            ->whereHas('status', fn ($query) => $query->where('name', 'En revisión'))
            ->orderBy('id')
            ->get();
    }

    /**
     * @return list<array{document_key: string, source_type: 'route'|'poi'|'incident', source_id: int, section: string, language: 'es', content: string, metadata: array<string, mixed>, checksum: string}>
     */
    private function routeDocuments(CyclingRoute $route): array
    {
        $metric = $route->metrics->sortByDesc('route_version')->first();
        $routeContent = $this->content([
            "Ruta: {$route->name}",
            $this->line('Descripción', $route->description),
            $this->line('Inicio', $route->start_name),
            $this->line('Final', $route->end_name),
            $this->line('Categoría', $route->category?->name),
            $this->line('Dificultad', $route->difficulty?->name),
            $this->line('Tipo de vía', $route->road_type),
            $this->line('Experiencia requerida', $route->required_experience),
            $this->metricLine($metric),
            $this->line('Recomendaciones', $route->recommendations->pluck('text')->filter()->implode('; ')),
            $this->line('Observaciones', $route->observations->pluck('text')->filter()->implode('; ')),
            $this->line('Descripción editorial de imágenes', $this->routeImageDescriptions($route)),
        ]);

        $documents = [$this->document('route', $route->id, 'route', $routeContent, [
            'route_id' => $route->id,
            'route_name' => $route->name,
            'category' => $route->category?->name,
            'difficulty' => $route->difficulty?->name,
        ])];

        foreach ($route->pointsOfInterest as $poi) {
            $content = $this->content([
                "POI de la ruta {$route->name}: {$poi->name}",
                $this->line('Categoría', $poi->category?->name),
                $this->line('Descripción', $poi->description),
                $this->line('Observaciones', $poi->observations),
                $this->line('Dirección', $poi->address),
                $this->line('Horarios', $this->hours($poi)),
                $this->line('Servicios y facilidades', $this->poiDetails($poi)),
                $this->line('Descripción editorial de imágenes', $this->imageDescriptions($poi)),
            ]);

            $documents[] = $this->document('poi', $poi->id, 'route_poi', $content, [
                'route_id' => $route->id,
                'route_name' => $route->name,
                'poi_id' => $poi->id,
                'poi_name' => $poi->name,
                'category' => $poi->category?->name,
            ]);
        }

        return $documents;
    }

    /**
     * @return array{document_key: string, source_type: 'route'|'poi'|'incident', source_id: int, section: string, language: 'es', content: string, metadata: array<string, mixed>, checksum: string}
     */
    private function poiDocument(PointOfInterest $poi): array
    {
        $routeNames = $poi->routes->pluck('name')->filter()->values()->all();
        $content = $this->content([
            "Punto de interés: {$poi->name}",
            $this->line('Categoría', $poi->category?->name),
            $this->line('Descripción', $poi->description),
            $this->line('Observaciones', $poi->observations),
            $this->line('Dirección', $poi->address),
            $this->line('Horarios', $this->hours($poi)),
            $this->line('Servicios y facilidades', $this->poiDetails($poi)),
            $this->line('Rutas activas relacionadas', implode('; ', $routeNames)),
            $this->line('Descripción editorial de imágenes', $this->imageDescriptions($poi)),
        ]);

        return $this->document('poi', $poi->id, 'poi', $content, [
            'poi_id' => $poi->id,
            'poi_name' => $poi->name,
            'category' => $poi->category?->name,
            'route_ids' => $poi->routes->pluck('id')->map(fn (mixed $id): int => (int) $id)->values()->all(),
        ]);
    }

    /**
     * @return array{document_key: string, source_type: 'route'|'poi'|'incident', source_id: int, section: string, language: 'es', content: string, metadata: array<string, mixed>, checksum: string}
     */
    private function incidentDocument(Incident $incident): array
    {
        $content = $this->content([
            'Alerta visible: '.($incident->type?->name ?? 'Incidencia'),
            $this->line('Ruta', $incident->route?->name),
            $this->line('Tipo', $incident->type?->name),
            $this->line('Descripción', $incident->description),
        ]);

        return $this->document('incident', $incident->id, 'alert', $content, [
            'incident_id' => $incident->id,
            'route_id' => $incident->route_id,
            'route_name' => $incident->route?->name,
            'type' => $incident->type?->name,
        ]);
    }

    /**
     * @param  'route'|'poi'|'incident'  $sourceType
     * @param  array<string, mixed>  $metadata
     * @return array{document_key: string, source_type: 'route'|'poi'|'incident', source_id: int, section: string, language: 'es', content: string, metadata: array<string, mixed>, checksum: string}
     */
    private function document(string $sourceType, int $sourceId, string $section, string $content, array $metadata): array
    {
        $payload = [
            'document_key' => $this->documentKey($sourceType, $sourceId, $section, $metadata),
            'source_type' => $sourceType,
            'source_id' => $sourceId,
            'section' => $section,
            'language' => 'es',
            'content' => $content,
            'metadata' => $metadata,
        ];

        return [...$payload, 'checksum' => hash('sha256', json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR))];
    }

    /**
     * A POI may appear in more than one route, so route-specific fragments
     * require the route identifier as part of their stable projection key.
     *
     * @param  'route'|'poi'|'incident'  $sourceType
     * @param  array<string, mixed>  $metadata
     */
    private function documentKey(string $sourceType, int $sourceId, string $section, array $metadata): string
    {
        if ($section === 'route_poi' && is_int($metadata['route_id'] ?? null)) {
            return "route:{$metadata['route_id']}:poi:{$sourceId}:route_poi";
        }

        return "{$sourceType}:{$sourceId}:{$section}";
    }

    private function metricLine(?RouteMetric $metric): ?string
    {
        if ($metric === null) {
            return null;
        }

        return 'Métrica: '.implode(', ', array_filter([
            $metric->distance_km === null ? null : "{$metric->distance_km} km",
            $metric->estimated_time_minutes === null ? null : "{$metric->estimated_time_minutes} min estimados",
            $metric->positive_elevation_m === null ? null : "+{$metric->positive_elevation_m} m",
            $metric->transportMode?->name,
        ]));
    }

    private function hours(PointOfInterest $poi): ?string
    {
        $hours = $poi->hours
            ->map(fn ($hour): ?string => $hour->weekday === null ? null : trim("{$hour->weekday} {$hour->opens_at}-{$hour->closes_at}"))
            ->filter()
            ->implode('; ');

        return $hours === '' ? null : $hours;
    }

    private function imageDescriptions(PointOfInterest $poi): ?string
    {
        $descriptions = $poi->images->pluck('description')->filter()->take(3)->implode('; ');

        return $descriptions === '' ? null : $descriptions;
    }

    /**
     * @return array<int|string, mixed>
     */
    private function poiRelations(): array
    {
        return [
            'category:id,name',
            'hours:id,point_of_interest_id,weekday,opens_at,closes_at',
            'images:id,point_of_interest_id,description,sort_order',
            'foodDetail:point_of_interest_id,cuisine_type_id,price_range_id,is_pet_friendly,has_wifi,accepted_payment_type,has_bike_parking,chef_recommendation',
            'foodDetail.cuisineType:id,name',
            'foodDetail.priceRange:id,name',
            'lodgingDetail:point_of_interest_id,lodging_type_id,allows_bikes_in_room,has_bike_wash_area,base_price',
            'lodgingDetail.lodgingType:id,name',
            'storeDetail:point_of_interest_id,store_type_id,sells_hydration,sells_snacks,accepted_payment_type',
            'storeDetail.storeType:id,name',
            'workshopDetail:point_of_interest_id,workshop_specialty_id,emergency_service,emergency_phone',
            'workshopDetail.specialty:id,name',
            'workshopDetail.services:id,name',
            'healthDetail:point_of_interest_id,health_center_type_id,has_defibrillator,care_level',
            'healthDetail.healthCenterType:id,name',
        ];
    }

    private function routeImageDescriptions(CyclingRoute $route): ?string
    {
        $descriptions = $route->images->pluck('description')->filter()->take(3)->implode('; ');

        return $descriptions === '' ? null : $descriptions;
    }

    private function poiDetails(PointOfInterest $poi): ?string
    {
        $food = $poi->foodDetail;
        $lodging = $poi->lodgingDetail;
        $store = $poi->storeDetail;
        $workshop = $poi->workshopDetail;
        $health = $poi->healthDetail;

        $details = array_filter([
            $food?->cuisineType?->name === null ? null : "Cocina {$food->cuisineType->name}",
            $food?->priceRange?->name === null ? null : "Rango de precio {$food->priceRange->name}",
            $food?->is_pet_friendly ? 'Acepta mascotas' : null,
            $food?->has_wifi ? 'Tiene wifi' : null,
            $food?->has_bike_parking ? 'Tiene estacionamiento para bicicletas' : null,
            $this->line('Pago', $food?->accepted_payment_type),
            $this->line('Recomendación', $food?->chef_recommendation),
            $lodging?->lodgingType?->name === null ? null : "Tipo de hospedaje {$lodging->lodgingType->name}",
            $lodging?->allows_bikes_in_room ? 'Permite bicicletas en la habitación' : null,
            $lodging?->has_bike_wash_area ? 'Tiene área de lavado para bicicletas' : null,
            $lodging?->base_price === null ? null : "Precio base {$lodging->base_price}",
            $store?->storeType?->name === null ? null : "Tipo de tienda {$store->storeType->name}",
            $store?->sells_hydration ? 'Vende hidratación' : null,
            $store?->sells_snacks ? 'Vende snacks' : null,
            $this->line('Pago', $store?->accepted_payment_type),
            $workshop?->specialty?->name === null ? null : "Especialidad de taller {$workshop->specialty->name}",
            $workshop?->emergency_service ? 'Ofrece servicio de emergencia' : null,
            $this->line('Teléfono de emergencia', $workshop?->emergency_phone),
            $workshop === null || $workshop->services->isEmpty() ? null : 'Servicios: '.$workshop->services->pluck('name')->filter()->implode(', '),
            $health?->healthCenterType?->name === null ? null : "Centro de salud {$health->healthCenterType->name}",
            $health?->has_defibrillator ? 'Tiene desfibrilador' : null,
            $health?->care_level === null ? null : "Nivel de atención {$health->care_level}",
        ]);

        $details = implode('; ', $details);

        return $details === '' ? null : $details;
    }

    /**
     * @param  list<string|null>  $lines
     */
    private function content(array $lines): string
    {
        return collect($lines)
            ->filter()
            ->map(fn (string $line): string => Str::squish($line))
            ->implode("\n");
    }

    private function line(string $label, ?string $value): ?string
    {
        $value = $value === null ? null : Str::squish($value);

        return $value === null || $value === '' ? null : "{$label}: {$value}";
    }
}
