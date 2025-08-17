<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::create(['name' => 'admin', 'description' => 'Administrator']);
        Role::create(['name' => 'teacher', 'description' => 'Teacher']);
        Role::create(['name' => 'student', 'description' => 'Student']);
    }
}