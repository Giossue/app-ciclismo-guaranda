<?php

namespace App\Contracts\Routing;

interface RoutePlanner
{
    /**
     * @param  list<array{latitude: float|int|string, longitude: float|int|string}>  $waypoints
     * @return array{geojson: array{type: 'LineString', coordinates: list<array{0: float, 1: float}>}, distance_km: float, estimated_time_minutes: int}
     */
    public function preview(array $waypoints): array;

    /**
     * Igual que preview() pero incluye las maniobras paso a paso para guiar
     * la navegación.
     *
     * @param  list<array{latitude: float|int|string, longitude: float|int|string}>  $waypoints
     * @return array{geojson: array{type: 'LineString', coordinates: list<array{0: float, 1: float}>}, distance_km: float, estimated_time_minutes: int, steps: list<array{distance_m: float, name: string, maneuver: array{type: string, modifier: string|null, exit: int|null, location: array{0: float, 1: float}}, coordinates: list<array{0: float, 1: float}>}>}
     */
    public function navigate(array $waypoints): array;
}
