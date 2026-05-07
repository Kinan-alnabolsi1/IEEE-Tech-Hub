<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectRole extends Model // تأكد من اسم الكلاس حسب ما سميته
{
    use HasFactory;

    // حدد اسم الجدول إذا كان مختلف (مثلاً project_roles)
    protected $table = 'project_roles'; // عدلها حسب اسم جدولك بالداتابيز

    // 🛑 هاد هو السطر السحري اللي بيسمح بحفظ البيانات
    protected $fillable = [
        'project_id',
        'role_name',
        'required_count'
    ];

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id', 'project_id');
    }
}