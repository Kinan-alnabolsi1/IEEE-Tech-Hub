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
    Schema::create('project_skills', function (Blueprint $table) {
        $table->id();
        $table->foreignId('project_id')->constrained('projects', 'project_id')->onDelete('cascade');
        $table->foreignId('skill_id')->constrained('skills', 'skill_id')->onDelete('cascade');
        
        // الحقول المطلوبة لنظام الـ AI والـ Scoring
        $table->integer('min_level')->default(1); // الحد الأدنى المطلوب للمستوى (1-5)
        $table->float('weight')->default(1.0);    // أهمية المهارة في هذا المشروع (وزنها)
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_skills');
    }
};
