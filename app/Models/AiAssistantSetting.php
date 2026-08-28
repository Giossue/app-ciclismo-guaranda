<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiAssistantSetting extends Model
{
    protected $table = 'configuracion_asistente_ia';

    protected $fillable = [
        'chat_model',
        'chat_reasoning_effort',
    ];
}
