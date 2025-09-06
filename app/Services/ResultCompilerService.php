<?php

namespace App\Services;

use App\Models\Result;
use App\Models\Student;
use App\Models\Term;
use App\Models\TermResult;
use App\Models\Classroom;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ResultCompilerService
{
    /**
     * Compile results for a specific classroom and term
     */
    public function compileResults($classroomId, $termId)
    {
        DB::beginTransaction();
        
        try {
            // Get all students in the classroom with user relationship
            $students = Student::with('user')->where('classroom_id', $classroomId)->get();
            
            $compiledResults = [];
            
            foreach ($students as $student) {
                $compiledResult = $this->compileStudentResults($student, $termId);
                $compiledResults[] = $compiledResult;
            }
            
            // Calculate positions for all students in the class
            $this->calculateClassPositions($compiledResults, $termId);
            
            DB::commit();
            
            return $compiledResults;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    /**
     * Compile results for a single student in a term
     */
    public function compileStudentResults(Student $student, $termId)
    {
        // Get all results for this student in this term
        $results = Result::where('student_id', $student->id)
            ->where('term_id', $termId)
            ->with(['subject', 'termResult'])
            ->get();
        
        if ($results->isEmpty()) {
            return null;
        }
        
        // Calculate averages and totals
        $totalScore = $results->sum('total_score');
        $averageScore = $results->avg('total_score');
        $numberOfSubjects = $results->count();
        
        // Format subjects data for frontend
        $subjects = $results->map(function ($result) {
            return [
                'subject_id' => $result->subject_id,
                'subject_name' => $result->subject->name,
                'ca_score' => $result->ca_score,
                'exam_score' => $result->exam_score,
                'total_score' => $result->total_score,
                'teacher_comment' => $result->teacher_comment,
                'grade' => $this->calculateGrade($result->total_score),
            ];
        })->toArray();
        
        // Get or create term result
        $termResult = TermResult::updateOrCreate(
            [
                'student_id' => $student->id,
                'term_id' => $termId,
            ],
            [
                'classroom_id' => $student->classroom_id,
                'average_score' => $averageScore,
                'position' => null, // Will be calculated later
            ]
        );
        
        // Attach termResult to each result for consistency
        $results->each(function ($result) use ($termResult) {
            $result->setRelation('termResult', $termResult);
        });
        
        return [
            'student' => $student,
            'term_result' => $termResult,
            'subjects' => $subjects,
            'results' => $results,
            'total_score' => $totalScore,
            'average_score' => $averageScore,
            'number_of_subjects' => $numberOfSubjects,
        ];
    }
    
    /**
     * Calculate grade based on score
     */
    private function calculateGrade($score)
    {
        if ($score >= 70) return 'A';
        if ($score >= 60) return 'B';
        if ($score >= 50) return 'C';
        if ($score >= 40) return 'D';
        return 'F';
    }
    
    /**
     * Calculate positions for all students in a class
     */
    protected function calculateClassPositions($compiledResults, $termId)
    {
        // Filter out null results and sort by average score
        $validResults = collect($compiledResults)
            ->filter()
            ->sortByDesc(function ($item) {
                return $item['average_score'];
            })
            ->values();
        
        // Assign positions
        $currentPosition = 1;
        $lastScore = null;
        $studentsAtPosition = 0;
        
        foreach ($validResults as $index => $compiledResult) {
            $currentScore = $compiledResult['average_score'];
            
            // If score is different from last score, update position
            if ($lastScore !== null && $currentScore < $lastScore) {
                $currentPosition += $studentsAtPosition;
                $studentsAtPosition = 1;
            } else {
                $studentsAtPosition++;
            }
            
            // Update the term result with the position
            $compiledResult['term_result']->update(['position' => $currentPosition]);
            
            $lastScore = $currentScore;
        }
    }
    
    /**
     * Generate grade and remark based on score
     */
    public function getGradeInfo($score)
    {
        if ($score >= 70) {
            return ['grade' => 'A', 'remark' => 'Excellent', 'points' => 5];
        } elseif ($score >= 60) {
            return ['grade' => 'B', 'remark' => 'Very Good', 'points' => 4];
        } elseif ($score >= 50) {
            return ['grade' => 'C', 'remark' => 'Good', 'points' => 3];
        } elseif ($score >= 45) {
            return ['grade' => 'D', 'remark' => 'Fair', 'points' => 2];
        } elseif ($score >= 40) {
            return ['grade' => 'E', 'remark' => 'Pass', 'points' => 1];
        } else {
            return ['grade' => 'F', 'remark' => 'Fail', 'points' => 0];
        }
    }
    
    /**
     * Get class statistics for a term
     */
    public function getClassStatistics($classroomId, $termId)
    {
        $results = Result::whereHas('student', function($query) use ($classroomId) {
            $query->where('classroom_id', $classroomId);
        })
        ->where('term_id', $termId)
        ->get();
        
        if ($results->isEmpty()) {
            return null;
        }
        
        $scores = $results->pluck('total_score');
        
        return [
            'total_students' => $results->unique('student_id')->count(),
            'total_results' => $results->count(),
            'average_score' => $scores->avg(),
            'highest_score' => $scores->max(),
            'lowest_score' => $scores->min(),
            'pass_rate' => $results->where('total_score', '>=', 40)->count() / $results->count() * 100,
            'grade_distribution' => $this->getGradeDistribution($scores),
        ];
    }
    
    /**
     * Get grade distribution for scores
     */
    protected function getGradeDistribution($scores)
    {
        $distribution = ['A' => 0, 'B' => 0, 'C' => 0, 'D' => 0, 'E' => 0, 'F' => 0];
        
        foreach ($scores as $score) {
            $gradeInfo = $this->getGradeInfo($score);
            $distribution[$gradeInfo['grade']]++;
        }
        
        return $distribution;
    }
    
    /**
     * Validate if compilation can be performed
     */
    public function canCompile($classroomId, $termId)
    {
        // Check if classroom exists and has students
        $classroom = Classroom::find($classroomId);
        if (!$classroom) {
            return ['can_compile' => false, 'message' => 'Classroom not found'];
        }
        
        $studentCount = Student::where('classroom_id', $classroomId)->count();
        if ($studentCount === 0) {
            return ['can_compile' => false, 'message' => 'No students found in this classroom'];
        }
        
        // Check if term exists
        $term = Term::find($termId);
        if (!$term) {
            return ['can_compile' => false, 'message' => 'Term not found'];
        }
        
        // Check if there are any results for this classroom and term
        $resultCount = Result::whereHas('student', function($query) use ($classroomId) {
            $query->where('classroom_id', $classroomId);
        })
        ->where('term_id', $termId)
        ->count();
        
        if ($resultCount === 0) {
            return ['can_compile' => false, 'message' => 'No results found for this classroom and term'];
        }
        
        return ['can_compile' => true, 'message' => 'Ready to compile'];
    }
}
