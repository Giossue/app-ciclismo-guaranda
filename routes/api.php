<?php

use App\Http\Controllers\Agent\AgentToolController;
use Illuminate\Support\Facades\Route;

Route::middleware('agent.tool')
    ->prefix('agent')
    ->name('agent.')
    ->group(function (): void {
        Route::post('routes', [AgentToolController::class, 'routes'])->name('routes');
        Route::post('navigation/progress', [AgentToolController::class, 'routeProgress'])->name('navigation.progress');
    });
