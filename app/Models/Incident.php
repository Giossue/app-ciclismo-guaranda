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
