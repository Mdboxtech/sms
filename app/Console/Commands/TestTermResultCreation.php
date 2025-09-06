<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Student;
use App\Models\Term;
use App\Models\Classroom;
use App\Models\TermResult;
use App\Models\Result;

class TestTermResultCreation extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:term-result-creation';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test term result creation to debug issues';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing Term Result Creation...');
        
        try {
            // Get a student
            $student = Student::first();
            if (!$student) {
                $this->error('No students found in database');
                return 1;
            }
            $this->info("Student: {$student->id} - {$student->user->name}");
            
            // Get a term
            $term = Term::first();
            if (!$term) {
                $this->error('No terms found in database');
                return 1;
            }
            $this->info("Term: {$term->id} - {$term->name}");
            
            // Get a classroom
            $classroom = Classroom::first();
            if (!$classroom) {
                $this->error('No classrooms found in database');
                return 1;
            }
            $this->info("Classroom: {$classroom->id} - {$classroom->name}");
            
            // Check if term result already exists
            $existingTermResult = TermResult::where('student_id', $student->id)
                ->where('term_id', $term->id)
                ->first();
            
            if ($existingTermResult) {
                $this->info("Term result already exists: {$existingTermResult->id}");
                $this->info("Testing comment update...");
                
                $existingTermResult->update([
                    'teacher_comment' => 'Test teacher comment',
                    'principal_comment' => 'Test principal comment'
                ]);
                
                $this->info("Comments updated successfully");
                return 0;
            }
            
            $this->info("Creating new term result...");
            
            // Get results for this student and term
            $results = Result::where('student_id', $student->id)
                ->where('term_id', $term->id)
                ->get();
            
            $this->info("Found {$results->count()} results for this student/term");
            
            $averageScore = $results->avg('total_score') ?? 0;
            $totalScore = $results->sum('total_score') ?? 0;
            
            $this->info("Average Score: $averageScore");
            $this->info("Total Score: $totalScore");
            
            // Try to create term result
            $termResult = TermResult::create([
                'student_id' => $student->id,
                'term_id' => $term->id,
                'classroom_id' => $classroom->id,
                'average_score' => round($averageScore, 2),
                'total_score' => $totalScore,
                'position' => 1,
                'teacher_comment' => 'Test teacher comment',
                'principal_comment' => 'Test principal comment'
            ]);
            
            if ($termResult) {
                $this->info("Term result created successfully: {$termResult->id}");
                return 0;
            } else {
                $this->error("Failed to create term result");
                return 1;
            }
            
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
            $this->error("File: " . $e->getFile());
            $this->error("Line: " . $e->getLine());
            return 1;
        }
    }
}
