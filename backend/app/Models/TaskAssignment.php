<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskAssignment extends Model
{
    protected $primaryKey = 'assignment_id';
    public $timestamps = false; // Because we use custom timestamp fields
    protected $guarded = [];

    protected $casts = [
        'assigned_at' => 'datetime',
        'completed_at' => 'datetime',
    ];
}
