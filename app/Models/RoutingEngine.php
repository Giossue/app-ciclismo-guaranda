<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoutingEngine extends Model
{
    protected $table = 'motores_enrutamiento';

    protected $guarded = ['id'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'active' => 'boolean',
        ];
    }
}
