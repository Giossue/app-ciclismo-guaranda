<?php

namespace App\Contracts\Routing;

interface RoutePlanner
{
    /**
     * @param  list<array{latitude: float|int|string, longitude: float|int|string}>  $waypoints
     * @return array{geojson: array{type: 'LineString', coordinates: list<array{0: float, 1: float}>}, distance_km: float, estimated_time_minutes: int}
     */
    public function preview(array $waypoints): array;
}
