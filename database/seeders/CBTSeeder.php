<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Exam;
use App\Models\Question;
use App\Models\Subject;
use App\Models\Term;
use App\Models\Classroom;
use App\Models\AcademicSession;
use App\Models\User;

class CBTSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create academic session
        $academicSession = AcademicSession::firstOrCreate([
            'name' => '2024/2025',
            'is_current' => true
        ], [
            'start_date' => '2024-09-01',
            'end_date' => '2025-07-31'
        ]);

        // Get or create terms
        $firstTerm = Term::firstOrCreate([
            'name' => 'First Term',
            'academic_session_id' => $academicSession->id,
            'start_date' => '2024-09-01',
            'end_date' => '2024-12-15'
        ]);

        $secondTerm = Term::firstOrCreate([
            'name' => 'Second Term',
            'academic_session_id' => $academicSession->id,
            'start_date' => '2025-01-06',
            'end_date' => '2025-04-05'
        ]);

        // Get or create classrooms
        $class1 = Classroom::firstOrCreate(['name' => 'JSS 1A']);
        $class2 = Classroom::firstOrCreate(['name' => 'JSS 1B']);
        $class3 = Classroom::firstOrCreate(['name' => 'JSS 2A']);

        // Get subjects
        $subjects = Subject::all();
        
        if ($subjects->isEmpty()) {
            $subjects = collect([
                Subject::create(['name' => 'Mathematics', 'code' => 'MTH']),
                Subject::create(['name' => 'English Language', 'code' => 'ENG']),
                Subject::create(['name' => 'Science', 'code' => 'SCI']),
            ]);
        }

        // Get or create a teacher user
        $teacherRole = \App\Models\Role::where('name', 'teacher')->first();
        $teacher = User::where('email', 'teacher@sms.com')->first();
        if (!$teacher) {
            $teacher = User::create([
                'name' => 'Test Teacher',
                'email' => 'teacher@sms.com',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'role_id' => $teacherRole ? $teacherRole->id : 1,
            ]);
        }

        // Create questions for each subject
        foreach ($subjects->take(3) as $subject) {
            for ($i = 1; $i <= 10; $i++) {
                Question::firstOrCreate([
                    'question_text' => "Sample {$subject->name} Question {$i}: What is the answer to this question?",
                    'question_type' => 'multiple_choice',
                    'subject_id' => $subject->id,
                    'teacher_id' => $teacher->id,
                ], [
                    'options' => [
                        'Option A',
                        'Option B', 
                        'Option C',
                        'Option D'
                    ],
                    'correct_answer' => 'Option A',
                    'marks' => rand(1, 5),
                    'difficulty_level' => ['easy', 'medium', 'hard'][rand(0, 2)],
                    'explanation' => 'This is the correct answer because...',
                    'is_active' => true,
                ]);
            }
        }

        // Create sample exams
        foreach ($subjects->take(2) as $subject) {
            $questions = Question::where('subject_id', $subject->id)->take(5)->pluck('id')->toArray();
            
            $exam = Exam::firstOrCreate([
                'title' => "Sample {$subject->name} Exam",
                'subject_id' => $subject->id,
                'teacher_id' => $teacher->id,
            ], [
                'description' => "This is a sample exam for {$subject->name}",
                'duration' => 60,
                'total_marks' => 25,
                'exam_type' => 'quiz',
                'instructions' => 'Read all questions carefully before answering.',
                'randomize_questions' => true,
                'randomize_options' => true,
                'show_results_immediately' => true,
                'is_published' => true,
            ]);

            // Attach questions to exam
            if (!empty($questions)) {
                $syncData = [];
                foreach ($questions as $questionId) {
                    $question = Question::find($questionId);
                    $syncData[$questionId] = [
                        'marks_allocated' => $question->marks ?? 5,
                        'question_order' => array_search($questionId, $questions) + 1,
                    ];
                }
                $exam->questions()->sync($syncData);
            }
        }

        $this->command->info('CBT test data seeded successfully!');
    }
}
