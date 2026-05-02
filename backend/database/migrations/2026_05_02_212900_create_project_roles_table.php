<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_roles', function (Blueprint $table) {
            $table->id();
            // ربط مع جدول المشاريع
            $table->unsignedBigInteger('project_id');
            $table->foreign('project_id')->references('project_id')->on('projects')->onDelete('cascade');
            
            $table->string('role_name', 100); // اسم الدور (مثال: Front-End Developer)
            $table->integer('required_count')->default(1); // العدد المطلوب (مثال: 3)
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_roles');
    }
};