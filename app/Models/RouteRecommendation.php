<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RouteRecommendation extends Model
{
    protected $table = 'recomendaciones_ruta';

    protected $guarded = ['id'];

    /**
     * @return BelongsTo<CyclingRoute, $this>
     */
    public function route(): BelongsTo
    {
        return $this->belongsTo(CyclingRoute::class, 'route_id');
    }
}
