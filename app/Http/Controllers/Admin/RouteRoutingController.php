<?php

namespace App\Http\Controllers\Admin;

use App\Contracts\Routing\RoutePlanner;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PreviewRouteRoutingRequest;
use App\Services\Routing\RouteNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Throwable;

class RouteRoutingController extends Controller
{
    public function __invoke(PreviewRouteRoutingRequest $request, RoutePlanner $planner): JsonResponse
    {
        try {
            return response()->json($planner->preview($request->validated()['waypoints']));
        } catch (RouteNotFoundException) {
            return response()->json([
                'message' => 'No se encontró una ruta ciclable entre esos puntos. Ajusta el inicio, el final o dibuja el trayecto manualmente.',
            ], 422);
        } catch (Throwable $exception) {
            Log::warning('OSRM route preview failed', [
                'exception' => $exception::class,
            ]);

            return response()->json([
                'message' => 'No se pudo generar el recorrido ahora. Puedes ajustar los puntos o dibujarlo manualmente.',
            ], 503);
        }
    }
}
