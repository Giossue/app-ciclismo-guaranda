<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiKnowledgeDocument extends Model
{
    protected $table = 'documentos_conocimiento_ia';

    protected $guarded = ['id'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'embedded_at' => 'datetime',
        ];
    }
}
