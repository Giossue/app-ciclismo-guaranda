<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateIncidentRequest;
use App\Models\AppNotification;
use App\Models\Incident;
use App\Models\IncidentStatus;
use App\Models\IncidentType;
use DateTimeInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class IncidentController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Incident::class);

        $incidents = Incident::query()
            ->with(['route:id,name,slug', 'type:id,name', 'status:id,name', 'user:id,name,last_name,email', 'files'])
            ->latest('reported_at')
            ->paginate(12)
            ->through(fn (Incident $incident): array => $this->serializeIncident($incident));

        return Inertia::render('admin/incidents/index', [
            'incidents' => $incidents,
            'statuses' => IncidentStatus::query()->orderBy('id')->get(['id', 'name']),
            'types' => IncidentType::query()->orderBy('id')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateIncidentRequest $request, Incident $incident): RedirectResponse
    {
        $payload = $request->validated();
        /** @var IncidentStatus $status */
        $status = IncidentStatus::query()->findOrFail($payload['incident_status_id']);

        $incident->forceFill([
            'incident_status_id' => $status->id,
            'admin_response' => $payload['admin_response'] ?? null,
            'resolved_at' => $status->name === 'resuelta' ? now() : null,
        ])->save();

        AppNotification::query()->create([
            'user_id' => $incident->user_id,
            'type' => 'incident_reviewed',
            'title' => 'Tu incidencia fue revisada',
            'message' => "La incidencia {$incident->title} cambió a estado {$status->name}.",
        ]);

        Inertia::flash('toast', ['type' => 'info', 'message' => __('Incidencia actualizada.')]);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeIncident(Incident $incident): array
    {
        $reportedAt = $incident->getAttribute('reported_at');
        $resolvedAt = $incident->getAttribute('resolved_at');

        return [
            'id' => $incident->id,
            'title' => $incident->title,
            'description' => Str::limit($incident->description, 180),
            'full_description' => $incident->description,
            'latitude' => (float) $incident->latitude,
            'longitude' => (float) $incident->longitude,
            'reported_at' => $reportedAt instanceof DateTimeInterface ? $reportedAt->format(DATE_ATOM) : null,
            'resolved_at' => $resolvedAt instanceof DateTimeInterface ? $resolvedAt->format(DATE_ATOM) : null,
            'admin_response' => $incident->admin_response,
            'route' => $incident->route === null ? null : [
                'id' => $incident->route->id,
                'name' => $incident->route->name,
                'slug' => $incident->route->slug,
            ],
            'type' => $incident->type === null ? null : ['id' => $incident->type->id, 'name' => $incident->type->name],
            'status' => $incident->status === null ? null : ['id' => $incident->status->id, 'name' => $incident->status->name],
            'user' => $incident->user === null ? null : [
                'id' => $incident->user->id,
                'name' => trim("{$incident->user->name} {$incident->user->last_name}"),
                'email' => $incident->user->email,
            ],
            'files' => $incident->files->map(fn ($file): array => [
                'id' => $file->id,
                'file_path' => $file->file_path,
                'file_type' => $file->file_type,
                'size_bytes' => $file->size_bytes,
            ])->values()->all(),
        ];
    }
}
