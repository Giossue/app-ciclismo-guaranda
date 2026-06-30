<?php

namespace App\Http\Controllers\Cyclist;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cyclist\StorePoiReportRequest;
use App\Models\PointOfInterest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class PoiReportController extends Controller
{
    public function store(StorePoiReportRequest $request, PointOfInterest $poi): RedirectResponse
    {
        $poi->reports()->create([
            ...$request->validated(),
            'user_id' => $request->user()?->id,
            'status' => 'pendiente',
            'reported_at' => now(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('POI report sent.')]);

        return back();
    }
}
