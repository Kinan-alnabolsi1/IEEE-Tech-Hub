<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BranchMembership extends Model
{
    protected $primaryKey = 'membership_id';
    public $timestamps = false; // نحن نستخدم custom timestamps في قاعدة البيانات
    protected $guarded = [];

    protected $casts = [
        'applied_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    public function user() {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function branch() {
        return $this->belongsTo(Branch::class, 'branch_id', 'branch_id');
    }
}
