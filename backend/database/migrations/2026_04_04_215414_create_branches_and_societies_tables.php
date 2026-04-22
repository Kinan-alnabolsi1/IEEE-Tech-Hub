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
        Schema::create('branches', function (Blueprint $table) {
            $table->id('branch_id');
            $table->unsignedBigInteger('admin_id')->nullable();
            $table->string('name', 150);
            $table->string('region', 100);
            $table->text('description')->nullable();
            $table->enum('status', ['Active', 'Suspended'])->default('Active');
            $table->string('contact_email', 150)->nullable();
            $table->string('contact_phone', 30)->nullable();
            $table->string('website_url', 255)->nullable();
            $table->date('founded_date')->nullable();
            $table->timestamps();

            $table->foreign('admin_id')->references('user_id')->on('users')->onDelete('cascade');
        });

        Schema::create('societies', function (Blueprint $table) {
            $table->id('society_id');
            $table->string('name', 150);
            $table->string('abbreviation', 20)->nullable();
            $table->text('description')->nullable();
            $table->string('classification', 100)->nullable();
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->timestamps();
        });

        Schema::create('branch_society', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('branch_id');
            $table->unsignedBigInteger('society_id');
            $table->timestamp('added_at')->useCurrent();

            $table->unique(['branch_id', 'society_id']);
            $table->foreign('branch_id')->references('branch_id')->on('branches')->onDelete('cascade');
            $table->foreign('society_id')->references('society_id')->on('societies')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void{
        Schema::dropIfExists('branch_society');
        Schema::dropIfExists('societies');
        Schema::dropIfExists('branches');    
    }
};
