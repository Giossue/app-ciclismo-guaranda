<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminAudit extends Model
{
    protected $table = 'auditorias_admin';

    protected $guarded = ['id'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'previous_values' => 'array',
            'new_values' => 'array',
            'action_at' => 'datetime',
        ];
    }
}
