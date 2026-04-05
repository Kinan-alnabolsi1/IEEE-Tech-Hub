<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    protected $primaryKey = 'branch_id';
    protected $guarded = [];

    public function admin() {
        return $this->belongsTo(User::class, 'admin_id', 'user_id');
    }

    public function societies() {
        return $this->belongsToMany(Society::class, 'branch_society', 'branch_id', 'society_id');
    }

    public function chapters() {
        return $this->hasMany(Chapter::class, 'branch_id', 'branch_id');
    }

    public function memberships() {
        return $this->hasMany(BranchMembership::class, 'branch_id', 'branch_id');
    }
}