<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chapter extends Model
{
    protected $primaryKey = 'chapter_id';
    protected $guarded = [];

    public function branch() {
        return $this->belongsTo(Branch::class, 'branch_id', 'branch_id');
    }

    public function society() {
        return $this->belongsTo(Society::class, 'society_id', 'society_id');
    }

    public function chair() {
        return $this->belongsTo(User::class, 'chair_id', 'user_id');
    }

    public function projects() {
        return $this->hasMany(Project::class, 'chapter_id', 'chapter_id');
    }
    public function members() {
        return $this->belongsToMany(User::class, 'chapter_user', 'chapter_id', 'user_id')
                    ->withPivot('role_in_chapter')
                    ->withTimestamps();
    }
}