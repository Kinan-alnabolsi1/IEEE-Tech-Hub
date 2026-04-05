<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $primaryKey = 'task_id';
    protected $guarded = [];

    public function project() {
        return $this->belongsTo(Project::class, 'project_id', 'project_id');
    }

    public function creator() {
        return $this->belongsTo(User::class, 'created_by', 'user_id');
    }

    public function assignments() {
        return $this->hasMany(TaskAssignment::class, 'task_id', 'task_id');
    }

    public function assignedUsers() {
        return $this->belongsToMany(User::class, 'task_assignments', 'task_id', 'user_id')
                    ->withPivot(['assigned_by', 'completion_pct', 'progress_note', 'completed_at']);
    }
}
