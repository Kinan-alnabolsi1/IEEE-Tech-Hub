<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('chapters', function (Blueprint $table) {
            $table->id('chapter_id');
            $table->unsignedBigInteger('branch_id');
            $table->unsignedBigInteger('society_id')->nullable();
            $table->unsignedBigInteger('chair_id')->nullable();
            $table->string('name', 150);
            $table->text('description')->nullable();
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->timestamps();

            $table->foreign('branch_id')->references('branch_id')->on('branches')->onDelete('cascade');
            $table->foreign('society_id')->references('society_id')->on('societies')->onDelete('set null');
            $table->foreign('chair_id')->references('user_id')->on('users')->onDelete('set null');
        });

        Schema::create('branch_memberships', function (Blueprint $table) {
            $table->id('membership_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('branch_id');
            $table->enum('status', ['Pending', 'Approved', 'Rejected', 'Suspended'])->default('Pending');
            $table->timestamp('applied_at')->useCurrent();
            $table->timestamp('reviewed_at')->nullable();
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->text('notes')->nullable();

            $table->unique(['user_id', 'branch_id']);
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('branch_id')->references('branch_id')->on('branches')->onDelete('cascade');
            $table->foreign('reviewed_by')->references('user_id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branch_memberships');
        Schema::dropIfExists('chapters');
    }
};
