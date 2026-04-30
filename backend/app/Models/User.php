<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'user_id';
    public $incrementing = true;
    protected $keyType = 'int';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'ieee_membership_number', 'username', 'email', 'password', 
        'full_name', 'role', 'branch_id', 'status', 'phone', 'bio', 'profile_photo'
    ];

    protected $appends = ['managed_chapter_id'];


    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relationships
    public function projectsAsLeader() {
        return $this->hasMany(Project::class, 'leader_id', 'user_id');
    }

    public function enrolledProjects() {
        return $this->belongsToMany(Project::class, 'project_members', 'user_id', 'project_id')
                    ->withPivot(['role', 'status', 'applied_at'])
                    ->wherePivot('status', 'Approved');
    }

    public function skills() {
        return $this->belongsToMany(Skill::class, 'user_skills', 'user_id', 'skill_id')
                    ->withPivot(['level', 'experience_years']);
    }

    public function tasks() {
        return $this->belongsToMany(Task::class, 'task_assignments', 'user_id', 'task_id');
    }

    public function branch()
{
    return $this->belongsTo(Branch::class);
}

public function chapters()
{
    return $this->belongsToMany(Chapter::class)->withPivot('role_in_chapter');
}


    // 2. علاقة المستخدم مع الفصل الذي يرأسه
    public function chairedChapter()
    {
        return $this->hasOne(Chapter::class, 'chair_id', 'user_id');
    }

    // 3. تعريف الـ Accessor (الذي سيضيف الـ id للـ JSON)
    public function getManagedChapterIdAttribute()
    {
        if ($this->role === 'Chapter Chair') {
            // جلب الـ ID الخاص بالفصل الذي يرأسه هذا المستخدم
            return $this->chairedChapter ? $this->chairedChapter->chapter_id : null;
        }
        return null;
    }
}
