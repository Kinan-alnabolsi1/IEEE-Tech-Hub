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
        // 👈 لاحظ استخدمنا اسم الجدول تبعك project_members
        Schema::table('project_members', function (Blueprint $table) {
            $table->unsignedTinyInteger('final_rating')->nullable()->comment('1 to 5 stars');
            $table->text('final_review')->nullable(); // المراجعة النهائية أو الشهادة
            $table->timestamp('evaluated_at')->nullable(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_members', function (Blueprint $table) {
            $table->dropColumn(['final_rating', 'final_review', 'evaluated_at']);
        });
    }
};
