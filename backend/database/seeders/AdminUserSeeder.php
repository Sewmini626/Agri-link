<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!User::where('email', 'admin@agrilink.com')->exists()) {
            User::create([
                'name' => 'System Admin',
                'email' => 'admin@agrilink.com',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'phone' => '0000000000',
                'address' => ' agricultural department'
            ]);
            $this->command->info('Admin user created successfully.');
        } else {
            $this->command->info('Admin user already exists.');
        }
    }
}
