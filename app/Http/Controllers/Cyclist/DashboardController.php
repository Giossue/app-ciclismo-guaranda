<?php

namespace App\Http\Controllers\Cyclist;

use App\Http\Controllers\Controller;
use App\Models\Track;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user instanceof User, 403);

        return Inertia::render('user/dashboard', [
            'progress' => $this->progress($user),
        ]);
    }

    /**
     * @return array{completed_tracks: int, distance_km: float, total_time_seconds: int}
     */
    private function progress(User $user): array
    {
        $totals = Track::query()
            ->whereBelongsTo($user)
            ->whereHas('status', fn (Builder $query) => $query->where('name', 'Finalizado'))
            ->selectRaw('COUNT(*) as completed_tracks')
            ->selectRaw('COALESCE(SUM(distance_traveled_km), 0) as distance_km')
            ->selectRaw('COALESCE(SUM(total_time_seconds), 0) as total_time_seconds')
            ->first();

        return [
            'completed_tracks' => (int) $totals?->getAttribute('completed_tracks'),
            'distance_km' => round((float) $totals?->getAttribute('distance_km'), 1),
            'total_time_seconds' => (int) $totals?->getAttribute('total_time_seconds'),
        ];
    }
}
