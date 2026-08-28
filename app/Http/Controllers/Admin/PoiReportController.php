<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ListPoiFeedbackRequest;
use App\Models\PoiReport;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class PoiReportController extends Controller
{
    /**
     * Display reports submitted for official points of interest.
     */
    public function __invoke(ListPoiFeedbackRequest $request): Response
    {
        $this->authorize('viewAny', PoiReport::class);

        $filters = $request->validated();
        $search = $filters['search'] ?? null;
        $perPage = (int) ($filters['per_page'] ?? 15);

        $reports = PoiReport::query()
            ->select([
                'id',
                'user_id',
                'point_of_interest_id',
                'report_type',
                'description',
                'status',
                'reported_at',
            ])
            ->with(['pointOfInterest:id,name', 'user:id,name,last_name'])
            ->when($search, function (Builder $query, string $search): void {
                $pattern = "%{$search}%";

                $query->where(function (Builder $query) use ($pattern): void {
                    $query
                        ->whereLike('report_type', $pattern)
                        ->orWhereLike('description', $pattern)
                        ->orWhereHas('pointOfInterest', fn (Builder $poiQuery) => $poiQuery->whereLike('name', $pattern))
                        ->orWhereHas('user', function (Builder $userQuery) use ($pattern): void {
                            $userQuery
                                ->whereLike('name', $pattern)
                                ->orWhereLike('last_name', $pattern);
                        });
                });
            })
            ->latest('reported_at')
            ->latest('id')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (PoiReport $report): array => $this->serializeReport($report));

        return Inertia::render('admin/pois/reports/index', [
            'reports' => $reports,
            'filters' => [
                'search' => $search ?? '',
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeReport(PoiReport $report): array
    {
        $reportedAt = $report->getAttribute('reported_at');

        return [
            'id' => $report->id,
            'report_type' => $report->report_type,
            'description' => $report->description,
            'status' => $report->status,
            'reported_at' => $reportedAt instanceof DateTimeInterface ? $reportedAt->format(DATE_ATOM) : null,
            'poi' => $report->pointOfInterest === null ? null : [
                'id' => $report->pointOfInterest->id,
                'name' => $report->pointOfInterest->name,
            ],
            'user' => $report->user === null ? null : trim("{$report->user->name} {$report->user->last_name}"),
        ];
    }
}
