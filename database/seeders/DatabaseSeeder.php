<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Classroom;
use App\Models\Subject;
use App\Models\Student;
use App\Models\AcademicSession;
use App\Models\Term;
use App\Models\Result;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Seed roles first
        $this->call(RoleSeeder::class);

        // Create admin user
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role_id' => Role::where('name', 'admin')->first()->id,
        ]);

        // Create teachers
        $this->call(TeacherSeeder::class);

        // Create classrooms
        $jss1 = Classroom::create(['name' => 'JSS 1', 'section' => 'A']);
        $jss2 = Classroom::create(['name' => 'JSS 2', 'section' => 'A']);

        // Create and assign subjects
        $this->call(SubjectSeeder::class);

        // Create academic session and term
        $session = AcademicSession::create([
            'name' => '2024/2025',
            'start_date' => '2024-09-01',
            'end_date' => '2025-07-31',
            'is_current' => true,
        ]);

        $term = Term::create([
            'academic_session_id' => $session->id,
            'name' => 'First Term',
            'start_date' => '2024-09-01',
            'end_date' => '2024-12-15',
            'is_current' => true,
        ]);

        // Create 5 students
        $students = [];
        for ($i = 1; $i <= 5; $i++) {
            $user = User::create([
                'name' => "Student $i",
                'email' => "student$i@example.com",
                'password' => Hash::make('password'),
                'role_id' => Role::where('name', 'student')->first()->id,
            ]);

            $student = Student::create([
                'user_id' => $user->id,
                'classroom_id' => $jss1->id,
                'admission_number' => '2024' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'date_of_birth' => '2010-01-01',
                'gender' => $i % 2 === 0 ? 'female' : 'male',
                'parent_name' => "Parent $i",
                'parent_phone' => '080' . str_pad($i, 8, '0', STR_PAD_LEFT),
                'address' => "Address $i",
            ]);

            $students[] = $student;
        }

        // Create sample results
        $teacher = User::where('email', 'teacher@example.com')->first();
        $subjects = Subject::take(3)->get();
        
        foreach ($students as $student) {
            foreach ($subjects as $subject) {
                Result::create([
                    'student_id' => $student->id,
                    'subject_id' => $subject->id,
                    'term_id' => $term->id,
                    'ca_score' => rand(25, 40),
                    'exam_score' => rand(35, 60),
                    'total_score' => 0, // Will be calculated before save
                    'teacher_id' => $teacher->id,
                ]);
            }
        }
    }
}
