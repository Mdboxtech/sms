<?php

namespace Database\Seeders;

use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Classroom;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = [
            ['name' => 'Mathematics', 'code' => 'MAT101', 'description' => 'Basic Mathematics'],
            ['name' => 'English Language', 'code' => 'ENG101', 'description' => 'English Language and Literature'],
            ['name' => 'Science', 'code' => 'SCI101', 'description' => 'General Science'],
            ['name' => 'Social Studies', 'code' => 'SOC101', 'description' => 'Social Studies and History'],
            ['name' => 'Computer Science', 'code' => 'CSC101', 'description' => 'Introduction to Computing'],
        ];

        foreach ($subjects as $subjectData) {
            $subject = Subject::firstOrCreate(
                ['code' => $subjectData['code']],
                $subjectData
            );

            // Assign subjects to teachers randomly
            $teachers = Teacher::inRandomOrder()->take(2)->get();
            $subject->teachers()->sync($teachers->pluck('id'));

            // Assign subjects to classrooms randomly
            $classrooms = Classroom::inRandomOrder()->take(3)->get();
            $subject->classrooms()->sync($classrooms->pluck('id'));
        }
    }
}
