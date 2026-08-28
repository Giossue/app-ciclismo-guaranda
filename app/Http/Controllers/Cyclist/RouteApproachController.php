<?php

namespace App\Http\Controllers\Cyclist;

use App\Contracts\Routing\RoutePlanner;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cyclist\RouteApproachRequest;
use App\Models\CyclingRoute;
use App\Services\Routing\RouteNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Throwable;

class RouteApproachController extends Controller
{
    /**
     * Camino sugerido desde la posición actual del ciclista hasta el punto de
     * partida de la ruta, calculado con OSRM.
     */
    public function __invoke(RouteApproachRequest $request, CyclingRoute $route, RoutePlanner $planner): JsonResponse
    {
        $validated = $request->validated();

        try {
            return response()->json($planner->preview([
                [
                    'latitude' => $validated['latitude'],
                    'longitude' => $validated['longitude'],
                ],
                [
                    'latitude' => $route->start_latitude,
                    'longitude' => $route->start_longitude,
                ],
            ]));
        } catch (RouteNotFoundException) {
            return response()->json([
                'message' => 'No encontramos un camino hasta el inicio de esta ruta.',
            ], 422);
        } catch (Throwable $exception) {
            Log::warning('OSRM approach preview failed', [
                'exception' => $exception::class,
            ]);

            return response()->json([
                'message' => 'No se pudo calcular el camino al inicio ahora.',
            ], 503);
        }
    }
}
