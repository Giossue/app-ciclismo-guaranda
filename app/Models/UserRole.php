<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserRole extends Model
{
    protected $table = 'roles_usuario';

    protected $guarded = ['id'];
}
