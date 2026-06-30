<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RouteRatingFile extends Model
{
    protected $table = 'archivos_valoracion_ruta';

    protected $guarded = ['id'];

    /**
     * @return BelongsTo<RouteRating, $this>
     */
    public function rating(): BelongsTo
    {
        return $this->belongsTo(RouteRating::class, 'route_rating_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'size_kb' => 'integer',
            'sort_order' => 'integer',
        ];
    }
}
