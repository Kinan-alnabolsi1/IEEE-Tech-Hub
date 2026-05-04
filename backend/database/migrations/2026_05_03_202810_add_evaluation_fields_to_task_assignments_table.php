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
        Schema::table('task_assignments', function (Blueprint $table) {
            // تقييم من 1 لـ 5 نجوم (استخدمنا TinyInteger لأنو رقم صغير وما بياخد مساحة)
            $table->unsignedTinyInteger('rating')->nullable()->comment('1 to 5 stars');
            $table->text('leader_feedback')->nullable(); // تعليق الليدر
            $table->timestamp('evaluated_at')->nullable(); // وقت التقييم
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('task_assignments', function (Blueprint $table) {
            $table->dropColumn(['rating', 'leader_feedback', 'evaluated_at']);
        });
    }   
};
