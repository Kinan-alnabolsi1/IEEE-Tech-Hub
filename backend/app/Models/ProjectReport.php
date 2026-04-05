<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectReport extends Model
{
    protected $primaryKey = 'report_id';
    protected $guarded = [];

    protected $casts = [
        'submitted_at' => 'datetime',
        'forwarded_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    public function project() {
        return $this->belongsTo(Project::class, 'project_id', 'project_id');
    }

    public function submitter() {
        return $this->belongsTo(User::class, 'submitted_by', 'user_id');
    }

    public function forwardedTo() {
        return $this->belongsTo(User::class, 'forwarded_to', 'user_id');
    }
}