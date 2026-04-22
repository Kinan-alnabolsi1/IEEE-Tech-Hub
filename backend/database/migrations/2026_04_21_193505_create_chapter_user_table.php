<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
    Schema::create('chapter_user', function (Blueprint $table) {
        $table->id();
        
        // 1. إنشاء الأعمدة أولاً
        $table->unsignedBigInteger('user_id');
        $table->unsignedBigInteger('chapter_id');
        
        $table->string('role_in_chapter')->default('member'); 
        $table->timestamps();

        // 2. الربط الصريح وتحديد اسم العمود المستهدف (user_id و chapter_id)
        $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        $table->foreign('chapter_id')->references('chapter_id')->on('chapters')->onDelete('cascade');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chapter_user');
    }
};
