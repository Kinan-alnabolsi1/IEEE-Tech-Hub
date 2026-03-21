<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
        'username' => 'superadmin',
        'email' => 'admin@ieee-techhub.org',
        'password' => Hash::make('admin123'),
        'full_name' => 'System Administrator',
        'role' => 'Super Admin',
        'status' => 'Active'
        ]);
    }
}
