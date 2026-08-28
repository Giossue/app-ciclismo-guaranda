<?php

namespace App\Services\Routing;

use App\Contracts\Routing\RoutePlanner;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Throwable;

class OsrmRouteService implements RoutePlanner
{
    /**
     * @param  list<array{latitude: float|int|string, longitude: float|int|string}>  $waypoints
     * @return array{geojson: array{type: 'LineString', coordinates: list<array{0: float, 1: float}>}, distance_km: float, estimated_time_minutes: int}
     */
    public function preview(array $waypoints): array
    {
        $response = $this->request($waypoints);
        $payload = $response->json();

        if ($response->status() === 400 && data_get($payload, 'code') === 'NoRoute') {
            throw new RouteNotFoundException;
        }

        if ($response->failed()) {
            throw new RuntimeException('OSRM returned an unsuccessful response.');
        }

        $route = data_get($payload, 'routes.0');
        $coordinates = data_get($route, 'geometry.coordinates');
        $distance = data_get($route, 'distance');
        $duration = data_get($route, 'duration');

        if (! is_array($coordinates) || count($coordinates) < 2 || ! is_numeric($distance) || ! is_numeric($duration)) {
            throw new RuntimeException('OSRM returned an invalid route preview.');
        }

        /** @var list<array{0: float, 1: float}> $normalizedCoordinates */
        $normalizedCoordinates = collect($coordinates)
            ->filter(fn (mixed $coordinate): bool => is_array($coordinate)
                && count($coordinate) >= 2
                && is_numeric($coordinate[0])
                && is_numeric($coordinate[1]))
            ->map(fn (array $coordinate): array => [(float) $coordinate[0], (float) $coordinate[1]])
            ->values()
            ->all();

        if (count($normalizedCoordinates) < 2) {
            throw new RuntimeException('OSRM route geometry is invalid.');
        }

        return [
            'geojson' => [
                'type' => 'LineString',
                'coordinates' => $normalizedCoordinates,
            ],
            'distance_km' => round((float) $distance / 1000, 3),
            'estimated_time_minutes' => max(1, (int) ceil((float) $duration / 60)),
        ];
    }

    /**
     * @param  list<array{latitude: float|int|string, longitude: float|int|string}>  $waypoints
     */
    private function request(array $waypoints): Response
    {
        $baseUrl = rtrim((string) config('guaranda.routing.osrm.base_url'), '/');

        if (filter_var($baseUrl, FILTER_VALIDATE_URL) === false) {
            throw new RuntimeException('OSRM is not configured.');
        }

        $coordinates = collect($waypoints)
            ->map(fn (array $point): string => sprintf('%.6F,%.6F', (float) $point['longitude'], (float) $point['latitude']))
            ->implode(';');

        try {
            return Http::acceptJson()
                ->connectTimeout(max(1, (int) config('guaranda.routing.osrm.connect_timeout_seconds', 1)))
                ->timeout(max(1, (int) config('guaranda.routing.osrm.timeout_seconds', 5)))
                ->get($baseUrl.'/route/v1/driving/'.$coordinates, [
                    'geometries' => 'geojson',
                    'overview' => 'full',
                    'steps' => 'false',
                ]);
        } catch (ConnectionException $exception) {
            throw new RuntimeException('OSRM is unavailable.', previous: $exception);
        } catch (Throwable $exception) {
            throw new RuntimeException('OSRM request failed.', previous: $exception);
        }
    }
}
