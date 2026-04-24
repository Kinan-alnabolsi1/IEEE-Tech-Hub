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
        Schema::create('project_members', function (Blueprint $table) {
            $table->id('pm_id');
            $table->unsignedBigInteger('project_id');
            $table->unsignedBigInteger('user_id');
            $table->enum('role', ['Leader', 'Member'])->default('Member');
            $table->enum('status', ['Pending', 'Approved', 'Rejected', 'Removed'])->default('Pending');
            $table->timestamp('applied_at')->useCurrent();
            $table->timestamp('joined_at')->nullable();
            $table->timestamp('removed_at')->nullable();

            $table->unique(['project_id', 'user_id']); // Prevent duplicate applications
            $table->foreign('project_id')->references('project_id')->on('projects')->onDelete('cascade');
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_members');
    }
};
