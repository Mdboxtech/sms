<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    public function run()
    {
        // Create classrooms first
        $classrooms = Classroom::factory()->count(10)->create();

        // Create students with their associated users
        $classrooms->each(function ($classroom) {
            Student::factory()
                ->count(random_int(20, 30))
                ->create([
                    'classroom_id' => $classroom->id
                ]);
        });
    }
}
