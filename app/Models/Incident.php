<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Incident extends Model
{
    protected $table = 'incidencias';

    protected $guarded = ['id'];

    /**
     * @return list<string>
     */
    private function routeBindingColumns(): array
    {
        return [
            'id',
            'user_id',
            'route_id',
            'incident_type_id',
            'incident_status_id',
            'description',
            'latitude',
            'longitude',
            'reported_at',
            'resolved_at',
            'admin_response',
            'created_at',
            'updated_at',
        ];
    }

    public function resolveRouteBindingQuery($query, $value, $field = null)
    {
        return parent::resolveRouteBindingQuery($query, $value, $field)
            ->select($this->routeBindingColumns());
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return BelongsTo<CyclingRoute, $this>
     */
    public function route(): BelongsTo
    {
        return $this->belongsTo(CyclingRoute::class, 'route_id');
    }

    /**
     * @return BelongsTo<IncidentType, $this>
     */
    public function type(): BelongsTo
    {
        return $this->belongsTo(IncidentType::class, 'incident_type_id');
    }

    /**
     * @return BelongsTo<IncidentStatus, $this>
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(IncidentStatus::class, 'incident_status_id');
    }

    /**
     * @return HasMany<IncidentFile, $this>
     */
    public function files(): HasMany
    {
        return $this->hasMany(IncidentFile::class, 'incident_id')->orderBy('id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'reported_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }
}
