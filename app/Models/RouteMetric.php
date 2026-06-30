<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RouteMetric extends Model
{
    protected $table = 'metricas_ruta';

    protected $guarded = ['id'];

    /**
     * @return BelongsTo<CyclingRoute, $this>
     */
    public function route(): BelongsTo
    {
        return $this->belongsTo(CyclingRoute::class, 'route_id');
    }

    /**
     * @return BelongsTo<TransportMode, $this>
     */
    public function transportMode(): BelongsTo
    {
        return $this->belongsTo(TransportMode::class, 'transport_mode_id');
    }

    /**
     * @return BelongsTo<RoutingEngine, $this>
     */
    public function routingEngine(): BelongsTo
    {
        return $this->belongsTo(RoutingEngine::class, 'routing_engine_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'route_version' => 'integer',
            'distance_km' => 'decimal:3',
            'estimated_time_minutes' => 'integer',
            'positive_elevation_m' => 'decimal:2',
            'negative_elevation_m' => 'decimal:2',
            'calculated_at' => 'datetime',
        ];
    }
}
