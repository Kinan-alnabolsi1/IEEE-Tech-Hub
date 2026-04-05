<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Society extends Model
{
    protected $primaryKey = 'society_id';
    protected $guarded = [];

    public function branches() {
        return $this->belongsToMany(Branch::class, 'branch_society', 'society_id', 'branch_id');
    }

    public function chapters() {
        return $this->hasMany(Chapter::class, 'society_id', 'society_id');
    }
}
