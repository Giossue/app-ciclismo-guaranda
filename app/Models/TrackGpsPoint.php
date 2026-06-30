<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrackGpsPoint extends Model
{
    protected $table = 'puntos_gps_recorrido';

    protected $guarded = ['id'];

    /**
     * @return BelongsTo<Track, $this>
     */
    public function track(): BelongsTo
    {
        return $this->belongsTo(Track::class, 'track_id');
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
            'elevation_m' => 'decimal:2',
            'speed_kmh' => 'decimal:3',
            'accuracy_m' => 'decimal:2',
            'recorded_at' => 'datetime',
        ];
    }
}
