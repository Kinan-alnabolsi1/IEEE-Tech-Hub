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
        'full_name', 'role', 'branch_id', 'status', 'phone', 'bio', 'profile_photo',
        'faculty', 'major', 'current_study_year', 'enrollment_year', 'expected_graduation_date','otp_code', 'otp_expires_at' ,"email_verified_at"
    ];

    protected $appends = ['managed_chapter_id', 'joined_chapters'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'chapters',
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
            'expected_graduation_date' => 'date',
            'otp_expires_at' => 'datetime',
        ];
    }

    // Relationships
    public function projectsAsLeader() {
        return $this->hasMany(Project::class, 'leader_id', 'user_id');
    }

    public function enrolledProjects() {
        return $this->belongsToMany(Project::class, 'project_members', 'user_id', 'project_id')
                    // 👈 ضفنا حقول التقييم النهائي هون
                    ->withPivot(['role', 'status', 'applied_at', 'final_rating', 'final_review', 'evaluated_at']) 
                    ->wherePivot('status', 'Approved');
    }

    public function skills() {
        return $this->belongsToMany(Skill::class, 'user_skills', 'user_id', 'skill_id')
                    ->withPivot(['level', 'experience_years']);
    }

    public function tasks() {
        return $this->belongsToMany(Task::class, 'task_assignments', 'user_id', 'task_id')
                    // 👈 ضفنا حقول تقييم المهمة هون
                    ->withPivot(['status', 'completion_pct', 'rating', 'leader_feedback', 'evaluated_at']); 
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function chapters()
    {
        // لازم نحدد اسم الجدول الوسيط والأعمدة يدوياً عشان لارافل ما يتفلسف من عنده
        return $this->belongsToMany(Chapter::class, 'chapter_user', 'user_id', 'chapter_id')
                    ->withPivot('role_in_chapter');
    }

    public function chairedChapter()
    {
        return $this->hasOne(Chapter::class, 'chair_id', 'user_id');
    }

    public function getManagedChapterIdAttribute()
    {
        if ($this->role === 'Chapter Chair') {
            return $this->chairedChapter ? $this->chairedChapter->chapter_id : null;
        }
        return null;
    }

    // 🌟 الإضافة الجديدة: Accessor لطباعة الفصول اللي منضم إلها المتطوع 🌟
    public function getJoinedChaptersAttribute()
    {
        // رح نلف على الفصول اللي هو فيها ونرجع معلوماتها بشكل خفيف ومرتب
        // إذا كان اليوزر مو منضم لأي chapter بيرجع مصفوفة فاضية []
        return $this->chapters->map(function($chapter) {
            return [
                'chapter_id' => $chapter->id ?? $chapter->chapter_id, // حسب شو مسمي الـ primary key عندك
                'name' => $chapter->name ?? $chapter->title, // حسب شو مسمي حقل الاسم عندك
            ];
        });
    }
}