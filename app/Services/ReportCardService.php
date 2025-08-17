<?php

namespace App\Services;

use App\Models\Result;
use App\Models\Student;
use App\Models\Term;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportCardService
{
    public function calculateGrade($score)
    {
        if ($score >= 70) {
            return ['grade' => 'A', 'remark' => 'Excellent'];
        } elseif ($score >= 60) {
            return ['grade' => 'B', 'remark' => 'Very Good'];
        } elseif ($score >= 50) {
            return ['grade' => 'C', 'remark' => 'Good'];
        } elseif ($score >= 45) {
            return ['grade' => 'D', 'remark' => 'Fair'];
        } elseif ($score >= 40) {
            return ['grade' => 'E', 'remark' => 'Pass'];
        } else {
            return ['grade' => 'F', 'remark' => 'Fail'];
        }
    }

    public function calculateAverage($results)
    {
        if (empty($results)) {
            return 0;
        }

        $total = array_sum(array_map(function($result) {
            return $result->total_score;
        }, $results));

        return $total / count($results);
    }

    public function determinePosition($scores, $score)
    {
        rsort($scores); // Sort in descending order
        $lastScore = null;
        $lastPosition = null;

        foreach ($scores as $index => $currentScore) {
            if ($lastScore !== null && $currentScore < $lastScore) {
                $lastPosition = $index + 1;
            }

            if ($currentScore === $score) {
                return $lastPosition ?? $index + 1;
            }

            $lastScore = $currentScore;
        }

        return count($scores);
    }

    protected function calculatePosition($studentId, $termId, $classroomId)
    {
        // Get all students' averages in the class for this term
        $averages = Result::selectRaw('student_id, AVG(total_score) as average_score')
            ->where('term_id', $termId)
            ->whereHas('student', function($query) use ($classroomId) {
                $query->where('classroom_id', $classroomId);
            })
            ->groupBy('student_id')
            ->orderByDesc('average_score')
            ->get();

        // Find the position of our student
        foreach ($averages as $index => $average) {
            if ($average->student_id == $studentId) {
                return $index + 1;
            }
        }

        return $averages->count() + 1;
    }

    public function generateReportCard(Student $student, Term $term)
    {
        $results = Result::where('student_id', $student->id)
            ->where('term_id', $term->id)
            ->with(['subject', 'term.academicSession'])
            ->get();

        // Get or create term result
        $termResult = \App\Models\TermResult::firstOrCreate(
            [
                'student_id' => $student->id,
                'term_id' => $term->id,
            ],
            [
                'classroom_id' => $student->classroom_id,
                'average_score' => $results->avg('total_score'),
                'position' => $this->calculatePosition($student->id, $term->id, $student->classroom_id)
            ]
        );

        // Get class average for comparison
        $classAverage = Result::where('term_id', $term->id)
            ->whereHas('student', function($query) use ($student) {
                $query->where('classroom_id', $student->classroom_id);
            })
            ->avg('total_score');

        $data = [
            'student' => $student->load('user'),
            'classroom' => $student->classroom,
            'term' => $term->load('academicSession'),
            'results' => $results,
            'total_score' => $results->sum('total_score'),
            'average_score' => $termResult->average_score,
            'class_average' => $classAverage,
            'position' => $termResult->position,
            'teacher_comment' => $termResult->teacher_comment,
            'principal_comment' => $termResult->principal_comment,
            'teacher_name' => $termResult->teacher->user->name ?? null,
            'principal_name' => $termResult->principal->name ?? null,
        ];

        $pdf = PDF::loadView('reports.report-card', $data);
        return $pdf;
    }
}
