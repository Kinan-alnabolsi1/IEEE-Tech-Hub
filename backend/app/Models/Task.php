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

    public function assignees()
    {
        return $this->belongsToMany(User::class, 'task_assignments', 'task_id', 'user_id')
                    ->withPivot([
                        'assignment_id',   // الآي دي تبع التكليف
                        'assigned_by',     // مين كلفه بالمهمة
                        'completion_pct',  // نسبة الإنجاز
                        'progress_note',   // ملاحظة التقدم
                        'rating',          // التقييم من 1 لـ 5
                        'leader_feedback', // تعليق القائد
                        'assigned_at',     // تاريخ التكليف
                        'evaluated_at',    // تاريخ التقييم
                        'completed_at'     // تاريخ الإنجاز
                    ]);
    }
}
