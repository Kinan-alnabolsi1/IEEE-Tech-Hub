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

    public function members() {
        return $this->belongsToMany(User::class, 'project_members', 'project_id', 'user_id')
                    ->withPivot(['role', 'status']);
    }

    public function requiredSkills() {
        return $this->belongsToMany(Skill::class, 'project_required_skills', 'project_id', 'skill_id')
                    ->withPivot(['min_level', 'weight']);
    }
}