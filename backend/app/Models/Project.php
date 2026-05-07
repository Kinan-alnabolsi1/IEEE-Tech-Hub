<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $primaryKey = 'project_id';
    protected $guarded = [];

    public function leader() {
        return $this->belongsTo(User::class, 'leader_id', 'user_id');
    }

    public function members(){
        // 👈 اسم الجدول الوسيط هو project_members
        return $this->belongsToMany(User::class, 'project_members', 'project_id', 'user_id')
                    ->withPivot(['role', 'status', 'applied_at', 'joined_at', 'final_rating', 'final_review', 'evaluated_at']); 
    }

    public function requiredSkills() 
    {
        return $this->belongsToMany(Skill::class, 'project_skills', 'project_id', 'skill_id')
                    ->withPivot(['min_level', 'weight'])
                    ->withTimestamps();
    }

    public function requiredRoles()
    {
        return $this->hasMany(ProjectRole::class, 'project_id', 'project_id');
    }

    /**
     * علاقة المشروع بالفصل الذي ينتمي إليه
     */
    public function chapter()
    {
        return $this->belongsTo(Chapter::class, 'chapter_id', 'chapter_id');
    }

    /**
     * اسم مستعار لعلاقة الفصل (لأن بعض أجزاء الكود تستخدم كلمة society بدل chapter)
     */
    public function society()
    {
        return $this->belongsTo(Chapter::class, 'chapter_id', 'chapter_id');
    }
}