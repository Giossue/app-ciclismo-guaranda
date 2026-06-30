<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RouteObservation extends Model
{
    protected $table = 'observaciones_ruta';

    protected $guarded = ['id'];

    /**
     * @return BelongsTo<CyclingRoute, $this>
     */
    public function route(): BelongsTo
    {
        return $this->belongsTo(CyclingRoute::class, 'route_id');
    }
}
