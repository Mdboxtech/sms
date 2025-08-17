<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Role;

class TeacherSeeder extends Seeder
{
    public function run(): void
    {
        // Create a demo teacher account
        $teacher = User::create([
            'name' => 'John Doe',
            'email' => 'teacher@example.com',
            'password' => Hash::make('password'),
            'role_id' => Role::where('name', 'teacher')->first()->id
        ]);

        // Create teacher profile
        $teacherProfile = Teacher::create([
            'user_id' => $teacher->id,
            'employee_id' => 'EMP001',
            'qualification' => 'B.Ed in Mathematics',
            'phone' => '1234567890',
            'address' => '123 Teacher Street',
            'date_joined' => now()
        ]);

        // Assign subjects and classes
        $subjects = Subject::take(3)->get();
        $classes = Classroom::take(2)->get();

        $teacherProfile->subjects()->attach($subjects->pluck('id'));
        $teacherProfile->classrooms()->attach($classes->pluck('id'));

        // Create more sample teachers
        $sampleTeachers = [
            [
                'name' => 'Jane Smith',
                'email' => 'jsmith@example.com',
                'qualification' => 'M.Ed in English',
                'phone' => '2345678901',
                'address' => '456 Educator Avenue'
            ],
            [
                'name' => 'Robert Wilson',
                'email' => 'rwilson@example.com',
                'qualification' => 'B.Ed in Science',
                'phone' => '3456789012',
                'address' => '789 Professor Lane'
            ]
        ];

        foreach ($sampleTeachers as $index => $sample) {
            $user = User::create([
                'name' => $sample['name'],
                'email' => $sample['email'],
                'password' => Hash::make('password'),
                'role_id' => Role::where('name', 'teacher')->first()->id
            ]);

            $teacher = Teacher::create([
                'user_id' => $user->id,
                'employee_id' => 'EMP00' . ($index + 2),
                'qualification' => $sample['qualification'],
                'phone' => $sample['phone'],
                'address' => $sample['address'],
                'date_joined' => now()->subMonths(rand(1, 12))
            ]);

            // Randomly assign subjects and classes
            $randomSubjects = Subject::inRandomOrder()->take(rand(2, 4))->get();
            $randomClasses = Classroom::inRandomOrder()->take(rand(1, 2))->get();

            $teacher->subjects()->attach($randomSubjects->pluck('id'));
            $teacher->classrooms()->attach($randomClasses->pluck('id'));
        }
    }
}
