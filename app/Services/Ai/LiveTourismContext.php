<?php

namespace App\Services\Ai;

use App\Models\CyclingRoute;
use App\Models\Incident;
use App\Models\PoiHour;
use App\Models\PointOfInterest;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class LiveTourismContext
{
    /**
     * @return array<string, mixed>
     */
    public function forMessage(?CyclingRoute $route, string $message, ?string $travelContext = null): array
    {
        return [
            'route' => $route === null ? $this->emptyRoute() : $this->route($route),
            'tourism_moments' => [
                'how_to_get_there' => 'cómo llegar y preparar el desplazamiento',
                'where_to_eat' => 'dónde comer',
                'what_to_do' => 'qué hacer y visitar',
                'where_to_sleep' => 'dónde dormir',
            ],
            'traveler_context' => $this->travelerContext($travelContext),
            'public_results' => $this->publicResults($message),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function forRoute(?CyclingRoute $route): array
    {
        return $this->forMessage($route, '');
    }

    /**
     * @return array{kind: string|null, label: string|null, guidance: string}
     */
    private function travelerContext(?string $travelContext): array
    {
        return match ($travelContext) {
            'local_cyclist' => [
                'kind' => 'local_cyclist',
                'label' => 'Salida local',
                'guidance' => 'Prioriza logística de la salida ciclista y lugares útiles durante el recorrido.',
            ],
            'day_visitor' => [
                'kind' => 'day_visitor',
                'label' => 'Visita por el día',
                'guidance' => 'Prioriza cómo llegar, comer y actividades que puedan hacerse sin pernoctar.',
            ],
            'overnight_tourist' => [
                'kind' => 'overnight_tourist',
                'label' => 'Me quedaré a dormir',
                'guidance' => 'Incluye opciones de alojamiento solo si están en el contexto verificado.',
            ],
            default => [
                'kind' => null,
                'label' => null,
                'guidance' => 'Un visitante suele estar de paso durante el día y un turista suele pernoctar. Si cambia la recomendación, pide esa preferencia antes de asumirla.',
            ],
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function emptyRoute(): array
    {
        return ['id' => null, 'name' => null, 'difficulty' => null, 'category' => null, 'description' => null, 'start' => null, 'end' => null, 'metric' => null, 'recommendations' => [], 'observations' => [], 'pois' => [], 'active_incidents' => []];
    }

    /**
     * @return array<string, mixed>
     */
    private function route(CyclingRoute $route): array
    {
        $route->loadMissing([
            'pointsOfInterest' => fn ($query) => $query->where('active', true)->with($this->poiRelations()),
        ]);

        $latestMetric = $route->metrics->sortByDesc('route_version')->first();

        return [
            'id' => $route->id,
            'name' => $route->name,
            'difficulty' => $route->difficulty?->name,
            'category' => $route->category?->name,
            'description' => Str::limit($route->description, 700),
            'start' => $route->start_name,
            'end' => $route->end_name,
            'metric' => $latestMetric === null ? null : [
                'distance_km' => (float) $latestMetric->distance_km,
                'estimated_time_minutes' => $latestMetric->estimated_time_minutes,
                'positive_elevation_m' => (float) $latestMetric->positive_elevation_m,
                'negative_elevation_m' => (float) $latestMetric->negative_elevation_m,
                'transport_mode' => $latestMetric->transportMode?->name,
            ],
            'recommendations' => $route->recommendations->pluck('text')->take(6)->values()->all(),
            'observations' => $route->observations->pluck('text')->take(6)->values()->all(),
            'pois' => $route->pointsOfInterest->take(8)->map(fn (PointOfInterest $poi): array => $this->poi($poi))->values()->all(),
            'active_incidents' => $route->incidents->take(6)->map(fn (Incident $incident): array => [
                'id' => $incident->id,
                'type' => $incident->type?->name,
                'title' => $incident->title,
                'description' => Str::limit($incident->description, 180),
            ])->values()->all(),
        ];
    }

    /**
     * @return array{routes: list<array<string, mixed>>, pois: list<array<string, mixed>>, active_incidents: list<array<string, mixed>>}
     */
    private function publicResults(string $message): array
    {
        $terms = $this->searchTerms($message);

        return [
            'routes' => CyclingRoute::query()
                ->select(['id', 'name', 'description', 'start_name', 'end_name', 'route_difficulty_id', 'route_category_id'])
                ->with(['difficulty:id,name', 'category:id,name'])
                ->whereHas('status', fn ($query) => $query->where('name', 'Activa'))
                ->when($terms !== [], fn ($query) => $query->where(function ($searchQuery) use ($terms): void {
                    foreach ($terms as $term) {
                        $this->orWhereContains($searchQuery, 'name', $term);
                        $this->orWhereContains($searchQuery, 'description', $term);
                        $this->orWhereContains($searchQuery, 'start_name', $term);
                        $this->orWhereContains($searchQuery, 'end_name', $term);
                    }
                }))
                ->orderBy('name')
                ->limit(4)
                ->get()
                ->map(fn (CyclingRoute $route): array => [
                    'id' => $route->id,
                    'name' => $route->name,
                    'difficulty' => $route->difficulty?->name,
                    'category' => $route->category?->name,
                    'description' => Str::limit($route->description, 200),
                    'start' => $route->start_name,
                    'end' => $route->end_name,
                ])
                ->values()
                ->all(),
            'pois' => PointOfInterest::query()
                ->select(['id', 'poi_category_id', 'name', 'description', 'observations', 'address', 'active'])
                ->with($this->poiRelations())
                ->where('active', true)
                ->when($terms !== [], fn ($query) => $query->where(function ($searchQuery) use ($terms): void {
                    foreach ($terms as $term) {
                        $this->orWhereContains($searchQuery, 'name', $term);
                        $this->orWhereContains($searchQuery, 'description', $term);
                        $this->orWhereContains($searchQuery, 'observations', $term);
                        $this->orWhereContains($searchQuery, 'address', $term);
                        $searchQuery->orWhereHas('category', fn ($categoryQuery) => $categoryQuery->whereRaw('LOWER(name) LIKE ?', ["%{$term}%"]));
                    }
                }))
                ->orderBy('name')
                ->limit(6)
                ->get()
                ->map(fn (PointOfInterest $poi): array => $this->poi($poi))
                ->values()
                ->all(),
            'active_incidents' => Incident::query()
                ->select(['id', 'route_id', 'incident_type_id', 'title', 'description', 'reported_at'])
                ->with(['route:id,name', 'type:id,name'])
                ->whereHas('route.status', fn ($query) => $query->where('name', 'Activa'))
                ->whereHas('status', fn ($query) => $query->where('name', 'En revisión'))
                ->latest('reported_at')
                ->latest('id')
                ->limit(4)
                ->get()
                ->map(fn (Incident $incident): array => [
                    'id' => $incident->id,
                    'route_id' => $incident->route_id,
                    'route_name' => $incident->route?->name,
                    'type' => $incident->type?->name,
                    'title' => $incident->title,
                    'description' => Str::limit($incident->description, 160),
                ])
                ->values()
                ->all(),
        ];
    }

    /**
     * @return array<int|string, mixed>
     */
    private function poiRelations(): array
    {
        return [
            'category:id,name',
            'hours:id,point_of_interest_id,weekday,opens_at,closes_at',
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

    /**
     * @return array<string, mixed>
     */
    private function poi(PointOfInterest $poi): array
    {
        $food = $poi->foodDetail;
        $lodging = $poi->lodgingDetail;
        $store = $poi->storeDetail;
        $workshop = $poi->workshopDetail;
        $health = $poi->healthDetail;

        return [
            'id' => $poi->id,
            'name' => $poi->name,
            'category' => $poi->category?->name,
            'description' => Str::limit((string) $poi->description, 180),
            'observations' => Str::limit((string) $poi->observations, 140),
            'address' => $poi->address,
            'hours' => $poi->hours->take(3)->map(fn (PoiHour $hour): array => [
                'weekday' => $hour->weekday,
                'opens_at' => $this->formatTime($hour->getAttribute('opens_at')),
                'closes_at' => $this->formatTime($hour->getAttribute('closes_at')),
            ])->values()->all(),
            'details' => array_filter([
                'food' => $food === null ? null : [
                    'cuisine' => $food->cuisineType?->name,
                    'price_range' => $food->priceRange?->name,
                    'accepts_pets' => $food->is_pet_friendly,
                    'has_wifi' => $food->has_wifi,
                    'has_bike_parking' => $food->has_bike_parking,
                    'payment' => $food->accepted_payment_type,
                    'recommendation' => $food->chef_recommendation,
                ],
                'lodging' => $lodging === null ? null : [
                    'type' => $lodging->lodgingType?->name,
                    'allows_bikes_in_room' => $lodging->allows_bikes_in_room,
                    'has_bike_wash_area' => $lodging->has_bike_wash_area,
                    'base_price' => $lodging->base_price,
                ],
                'store' => $store === null ? null : [
                    'type' => $store->storeType?->name,
                    'sells_hydration' => $store->sells_hydration,
                    'sells_snacks' => $store->sells_snacks,
                    'payment' => $store->accepted_payment_type,
                ],
                'workshop' => $workshop === null ? null : [
                    'specialty' => $workshop->specialty?->name,
                    'emergency_service' => $workshop->emergency_service,
                    'emergency_phone' => $workshop->emergency_phone,
                    'services' => $workshop->services->pluck('name')->filter()->values()->all(),
                ],
                'health' => $health === null ? null : [
                    'type' => $health->healthCenterType?->name,
                    'has_defibrillator' => $health->has_defibrillator,
                    'care_level' => $health->care_level,
                ],
            ]),
        ];
    }

    /**
     * @return list<string>
     */
    private function searchTerms(string $message): array
    {
        return collect(preg_split('/[^\pL\pN]+/u', Str::lower($message)) ?: [])
            ->filter(fn (string $term): bool => mb_strlen($term) >= 4)
            ->unique()
            ->take(4)
            ->values()
            ->all();
    }

    private function orWhereContains(Builder $query, string $column, string $term): void
    {
        $query->orWhereRaw("LOWER({$column}) LIKE ?", ["%{$term}%"]);
    }

    private function formatTime(mixed $value): ?string
    {
        if ($value instanceof DateTimeInterface) {
            return $value->format('H:i');
        }

        return is_string($value) && $value !== '' ? substr($value, 0, 5) : null;
    }
}
