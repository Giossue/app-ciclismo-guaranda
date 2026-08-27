<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RouteStatus extends Model
{
    protected $table = 'estados_ruta';

    protected $guarded = ['id'];

    /**
     * @return HasMany<CyclingRoute, $this>
     */
    public function routes(): HasMany
    {
        return $this->hasMany(CyclingRoute::class, 'route_status_id');
    }
}
