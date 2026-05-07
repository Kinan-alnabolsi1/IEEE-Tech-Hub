<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskAssignment extends Model
{
    protected $table = 'task_assignments'; // تأكيد اسم الجدول
    protected $primaryKey = 'assignment_id';
    public $timestamps = false; 
    protected $guarded = [];

    protected $casts = [
        'assigned_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * العلاقة مع المهمة الأساسية
     * كل تكليف ينتمي لمهمة واحدة
     */
    public function task(): BelongsTo
    {
        // نحدد اسم المفتاح الغريب task_id والمفتاح الأساسي في جدول المهام task_id
        return $this->belongsTo(Task::class, 'task_id', 'task_id');
    }

    /**
     * العلاقة مع المستخدم (المتطوع المكلف)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}