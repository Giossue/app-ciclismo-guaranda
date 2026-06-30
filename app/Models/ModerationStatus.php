<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModerationStatus extends Model
{
    protected $table = 'estados_moderacion';

    protected $guarded = ['id'];
}
