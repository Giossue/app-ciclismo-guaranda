<?php

use App\Http\Controllers\Admin\CatalogController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\IncidentController as AdminIncidentController;
use App\Http\Controllers\Admin\PoiController as AdminPoiController;
use App\Http\Controllers\Admin\RatingController as AdminRatingController;
use App\Http\Controllers\Admin\RouteController as AdminRouteController;
use App\Http\Controllers\Admin\RouteElevationController;
use App\Http\Controllers\Admin\StatisticsController;
use App\Http\Controllers\Admin\SystemSettingsController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AppNotificationController;
use App\Http\Controllers\Cyclist\ChatController;
use App\Http\Controllers\Cyclist\FavoriteRouteController;
use App\Http\Controllers\Cyclist\IncidentController as CyclistIncidentController;
use App\Http\Controllers\Cyclist\OfflineRouteController;
use App\Http\Controllers\Cyclist\PoiReportController;
use App\Http\Controllers\Cyclist\PoiSuggestionController;
use App\Http\Controllers\Cyclist\RouteController as CyclistRouteController;
use App\Http\Controllers\Cyclist\RouteRatingController;
use App\Http\Controllers\Cyclist\SyncController;
use App\Http\Controllers\Cyclist\TrackController as CyclistTrackController;
use App\Http\Controllers\DashboardRedirectController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardRedirectController::class)->name('dashboard');
    Route::get('notifications', [AppNotificationController::class, 'index'])->name('notifications.index');
    Route::patch('notifications/read-all', [AppNotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::patch('notifications/{notification}/read', [AppNotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::inertia('menu', 'menu/index')->name('menu.index');
    Route::get('chat', [ChatController::class, 'index'])->name('chat.index');
    Route::post('chat/messages', [ChatController::class, 'store'])->middleware('throttle:12,1')->name('chat.messages.store');
    Route::delete('chat/conversations/{conversation}', [ChatController::class, 'destroy'])->name('chat.conversations.destroy');
    Route::get('routes', [CyclistRouteController::class, 'index'])->name('routes.index');
    Route::get('favorites', [FavoriteRouteController::class, 'index'])->name('favorites.index');
    Route::get('routes/{route:slug}', [CyclistRouteController::class, 'show'])->name('routes.show');
    Route::get('routes/{route:slug}/offline-package', [OfflineRouteController::class, 'show'])->name('routes.offline-package.show');
    Route::post('routes/{route:slug}/downloads', [OfflineRouteController::class, 'store'])->name('routes.downloads.store');
    Route::post('routes/{route:slug}/favorite', [FavoriteRouteController::class, 'store'])->name('routes.favorite.store');
    Route::delete('routes/{route:slug}/favorite', [FavoriteRouteController::class, 'destroy'])->name('routes.favorite.destroy');
    Route::post('routes/{route:slug}/ratings', [RouteRatingController::class, 'store'])->name('routes.ratings.store');
    Route::patch('route-ratings/{rating}', [RouteRatingController::class, 'update'])->name('route-ratings.update');
    Route::delete('route-ratings/{rating}', [RouteRatingController::class, 'destroy'])->name('route-ratings.destroy');
    Route::post('sync/offline-events', [SyncController::class, 'store'])->name('sync.offline-events.store');
    Route::post('routes/{route:slug}/tracks', [CyclistTrackController::class, 'store'])->name('tracks.store');
    Route::get('tracks/{track}', [CyclistTrackController::class, 'show'])->name('tracks.show');
    Route::post('tracks/{track}/points', [CyclistTrackController::class, 'point'])->name('tracks.points.store');
    Route::patch('tracks/{track}/pause', [CyclistTrackController::class, 'pause'])->name('tracks.pause');
    Route::patch('tracks/{track}/resume', [CyclistTrackController::class, 'resume'])->name('tracks.resume');
    Route::patch('tracks/{track}/finish', [CyclistTrackController::class, 'finish'])->name('tracks.finish');
    Route::patch('tracks/{track}/cancel', [CyclistTrackController::class, 'cancel'])->name('tracks.cancel');
    Route::get('tracks/{track}/export', [CyclistTrackController::class, 'export'])->name('tracks.export');
    Route::post('incidents', [CyclistIncidentController::class, 'store'])->name('incidents.store');
    Route::post('pois/suggestions', [PoiSuggestionController::class, 'store'])->name('pois.suggestions.store');
    Route::post('pois/{poi}/reports', [PoiReportController::class, 'store'])->name('pois.reports.store');
});

Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::redirect('/', '/admin/dashboard')->name('index');
        Route::get('dashboard', DashboardController::class)->name('dashboard');

        Route::post('routes/elevation-preview', RouteElevationController::class)->middleware('throttle:20,1')->name('routes.elevation-preview');
        Route::resource('routes', AdminRouteController::class)->except(['show']);
        Route::resource('pois', AdminPoiController::class)->except(['show'])->withTrashed(['edit', 'update']);
        Route::patch('pois/{poi}/restore', [AdminPoiController::class, 'restore'])->withTrashed()->name('pois.restore');
        Route::resource('incidents', AdminIncidentController::class)->only(['index', 'update']);
        Route::resource('ratings', AdminRatingController::class)->only(['index', 'update']);
        Route::get('catalogs', [CatalogController::class, 'index'])->name('catalogs.index');
        Route::post('catalogs/{catalog}', [CatalogController::class, 'store'])->name('catalogs.store');
        Route::patch('catalogs/{catalog}/{record}', [CatalogController::class, 'update'])->name('catalogs.update');
        Route::get('statistics', [StatisticsController::class, 'index'])->name('statistics.index');
        Route::get('statistics/export', [StatisticsController::class, 'export'])->name('statistics.export');
        Route::get('settings', SystemSettingsController::class)->name('settings.index');

        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::patch('users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::patch('users/{user}/restore', [UserController::class, 'restore'])->withTrashed()->name('users.restore');
        Route::post('users/{user}/password-reset', [UserController::class, 'sendPasswordResetLink'])->name('users.password-reset');
    });

require __DIR__.'/settings.php';
