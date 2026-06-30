<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Track extends Model
{
    use SoftDeletes;

    protected $table = 'recorridos';

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
     * @return BelongsTo<TrackStatus, $this>
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(TrackStatus::class, 'track_status_id');
    }

    /**
     * @return HasMany<TrackGpsPoint, $this>
     */
    public function gpsPoints(): HasMany
    {
        return $this->hasMany(TrackGpsPoint::class, 'track_id')->orderBy('recorded_at');
    }

    /**
     * @return HasMany<RouteRating, $this>
     */
    public function ratings(): HasMany
    {
        return $this->hasMany(RouteRating::class, 'track_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'distance_traveled_km' => 'decimal:3',
            'total_time_seconds' => 'integer',
            'completion_percentage' => 'decimal:2',
            'is_valid' => 'boolean',
            'summary' => 'array',
        ];
    }
}
