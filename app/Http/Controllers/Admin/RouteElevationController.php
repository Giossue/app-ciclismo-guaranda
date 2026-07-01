<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PreviewRouteElevationRequest;
use App\Services\Elevation\OpenTopoDataElevationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Throwable;

class RouteElevationController extends Controller
{
    public function __invoke(PreviewRouteElevationRequest $request, OpenTopoDataElevationService $service): JsonResponse
    {
        $payload = $request->validated();

        try {
            /** @var array<int, array{0: float|int|string, 1: float|int|string}> $coordinates */
            $coordinates = $payload['geojson']['coordinates'];
            $result = $service->calculateForLineString($coordinates);

            return response()->json($result);
        } catch (Throwable $exception) {
            Log::warning('OpenTopoData elevation calculation failed', [
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'No se pudo calcular el desnivel con OpenTopoData. Intenta nuevamente o ingresa los valores manualmente.',
            ], 422);
        }
    }
}
