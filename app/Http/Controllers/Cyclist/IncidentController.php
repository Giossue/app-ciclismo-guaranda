<?php

namespace App\Http\Controllers\Cyclist;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cyclist\StoreIncidentRequest;
use App\Models\AppNotification;
use App\Models\Incident;
use App\Models\IncidentStatus;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class IncidentController extends Controller
{
    public function store(StoreIncidentRequest $request): RedirectResponse
    {
        $payload = $request->validated();
        $reportedStatus = IncidentStatus::query()->where('name', 'reportada')->firstOrFail();

        DB::transaction(function () use ($request, $payload, $reportedStatus): void {
            $incident = Incident::query()->create([
                'user_id' => $request->user()?->id,
                'route_id' => $payload['route_id'],
                'incident_type_id' => $payload['incident_type_id'],
                'incident_status_id' => $reportedStatus->id,
                'title' => $payload['title'],
                'description' => $payload['description'],
                'latitude' => $payload['latitude'],
                'longitude' => $payload['longitude'],
                'reported_at' => now(),
            ]);

            $this->syncPostgisPoint($incident);

            if ($request->hasFile('photo')) {
                $photo = $request->file('photo');
                $path = $photo->store('incidents', 'public');

                $incident->files()->create([
                    'file_path' => $path,
                    'file_type' => 'image',
                    'size_bytes' => $photo->getSize(),
                    'uploaded_at' => now(),
                ]);
            }

            $this->notifyAdministrators($incident);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Incident reported for review.')]);

        return back();
    }

    private function syncPostgisPoint(Incident $incident): void
    {
        if (DB::getDriverName() !== 'pgsql' || ! Schema::hasColumn('incidencias', 'geom')) {
            return;
        }

        DB::statement(
            'UPDATE incidencias SET geom = ST_SetSRID(ST_MakePoint(?, ?), 4326) WHERE id = ?',
            [(float) $incident->longitude, (float) $incident->latitude, $incident->id]
        );
    }

    private function notifyAdministrators(Incident $incident): void
    {
        User::query()
            ->whereHas('role', fn ($query) => $query->where('name', 'administrador'))
            ->where('active', true)
            ->get(['id'])
            ->each(fn (User $admin): AppNotification => AppNotification::query()->create([
                'user_id' => $admin->id,
                'type' => 'incident_reported',
                'title' => 'Nueva incidencia reportada',
                'message' => "Se reportó la incidencia {$incident->title} y requiere revisión administrativa.",
            ]));
    }
}
