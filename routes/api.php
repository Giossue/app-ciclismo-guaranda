<?php

use App\Http\Controllers\Agent\AgentToolController;
use Illuminate\Support\Facades\Route;

Route::middleware('agent.tool')
    ->prefix('agent')
    ->name('agent.')
    ->group(function (): void {
        Route::post('routes/search', [AgentToolController::class, 'searchRoutes'])->name('routes.search');
        Route::get('routes/{route}', [AgentToolController::class, 'showRoute'])->name('routes.show');
        Route::get('routes/{route}/alerts', [AgentToolController::class, 'routeAlerts'])->name('routes.alerts');
        Route::post('pois/search', [AgentToolController::class, 'searchPois'])->name('pois.search');
        Route::post('navigation/progress', [AgentToolController::class, 'routeProgress'])->name('navigation.progress');
    });
