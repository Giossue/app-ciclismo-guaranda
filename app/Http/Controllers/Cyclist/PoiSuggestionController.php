<?php

namespace App\Http\Controllers\Cyclist;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cyclist\StorePoiSuggestionRequest;
use App\Models\PoiSuggestion;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class PoiSuggestionController extends Controller
{
    public function store(StorePoiSuggestionRequest $request): RedirectResponse
    {
        PoiSuggestion::query()->create([
            ...$request->validated(),
            'user_id' => $request->user()?->id,
            'status' => 'pendiente',
            'suggested_at' => now(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('POI suggestion sent.')]);

        return back();
    }
}
