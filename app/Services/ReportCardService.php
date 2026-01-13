<?php

namespace App\Services;

use App\Models\Result;
use App\Models\Student;
use App\Models\Term;
use App\Models\TermResult;
use App\Models\AcademicSession;
use App\Models\Classroom;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ReportCardService
{
    public function calculateGrade($score)
    {
        if ($score >= 90) {
            return ['grade' => 'A+', 'remark' => 'Outstanding', 'points' => 5.0];
        } elseif ($score >= 80) {
            return ['grade' => 'A', 'remark' => 'Excellent', 'points' => 4.5];
        } elseif ($score >= 70) {
            return ['grade' => 'B+', 'remark' => 'Very Good', 'points' => 4.0];
        } elseif ($score >= 60) {
            return ['grade' => 'B', 'remark' => 'Good', 'points' => 3.5];
        } elseif ($score >= 50) {
            return ['grade' => 'C+', 'remark' => 'Fair', 'points' => 3.0];
        } elseif ($score >= 45) {
            return ['grade' => 'C', 'remark' => 'Satisfactory', 'points' => 2.5];
        } elseif ($score >= 40) {
            return ['grade' => 'D', 'remark' => 'Pass', 'points' => 2.0];
        } else {
            return ['grade' => 'F', 'remark' => 'Fail', 'points' => 0.0];
        }
    }

    public function calculateGPA($results)
    {
        if (empty($results)) {
            return 0.0;
        }

        $totalPoints = 0;
        $totalSubjects = count($results);

        foreach ($results as $result) {
            $gradeInfo = $this->calculateGrade($result->total_score);
            $totalPoints += $gradeInfo['points'];
        }

        return round($totalPoints / $totalSubjects, 2);
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
            ->with(['subject', 'term.academicSession', 'teacher.user'])
            ->orderBy('subject_id')
            ->get();

        if ($results->isEmpty()) {
            throw new \Exception('No results found for this student in the specified term.');
        }

        // Calculate comprehensive statistics
        $totalScore = $results->sum('total_score');
        $averageScore = $results->avg('total_score');
        $highestScore = $results->max('total_score');
        $lowestScore = $results->min('total_score');
        $gpa = $this->calculateGPA($results);

        // Get or create/update term result
        $termResult = TermResult::updateOrCreate(
            [
                'student_id' => $student->id,
                'term_id' => $term->id,
            ],
            [
                'classroom_id' => $student->classroom_id,
                'average_score' => round($averageScore, 2),
                'total_score' => $totalScore,
                'position' => $this->calculatePosition($student->id, $term->id, $student->classroom_id),
                'gpa' => $gpa
            ]
        );

        // Get class statistics
        $classStats = $this->getClassStatistics($term->id, $student->classroom_id);

        // Get attendance data (if available)
        $attendanceData = $this->getAttendanceData($student->id, $term->id);

        // Get principal and class teacher comments
        $comments = $this->getComments($termResult);

        // Calculate grading scale
        $gradingScale = $this->getGradingScale();

        // Get settings individually (more reliable than getAllSettings)
        $schoolName = \App\Models\Setting::getValue('school_name', config('app.name', 'Excellence Academy'));
        $schoolAddress = \App\Models\Setting::getValue('school_address', 'School Address Here');
        $schoolPhone = \App\Models\Setting::getValue('school_phone', '+234-XXX-XXX-XXXX');
        $schoolEmail = \App\Models\Setting::getValue('school_email', 'info@school.edu.ng');
        $schoolLogo = \App\Models\Setting::getValue('school_logo', null);
        $schoolTagline = \App\Models\Setting::getValue('school_tagline', 'Excellence in Education');
        $schoolPrimaryColor = \App\Models\Setting::getValue('school_primary_color', '#1e40af');
        $schoolSecondaryColor = \App\Models\Setting::getValue('school_secondary_color', '#f59e0b');
        
        // Prepare school info
        $schoolInfo = [
            'name' => $schoolName,
            'address' => $schoolAddress,
            'phone' => $schoolPhone,
            'email' => $schoolEmail,
            'logo' => $schoolLogo,
            'tagline' => $schoolTagline,
            'contact_line' => \App\Models\Setting::getValue('school_contact_line', "Tel: {$schoolPhone} | Email: {$schoolEmail}")
        ];

        // Get app settings for styling with base64 logo
        $appSettings = [
            'school_name' => $schoolName,
            'school_address' => $schoolAddress,
            'school_phone' => $schoolPhone,
            'school_email' => $schoolEmail,
            'school_logo' => null, // Will be set below as base64
            'school_tagline' => $schoolTagline,
            'school_primary_color' => $schoolPrimaryColor,
            'school_secondary_color' => $schoolSecondaryColor,
        ];

        // Convert logo to base64 for PDF compatibility
        if (!empty($schoolLogo)) {
            $logoPath = storage_path('app/public/' . $schoolLogo);
            if (file_exists($logoPath)) {
                $logoData = file_get_contents($logoPath);
                $logoBase64 = base64_encode($logoData);
                $mimeType = mime_content_type($logoPath);
                $appSettings['school_logo'] = 'data:' . $mimeType . ';base64,' . $logoBase64;
                $schoolInfo['logo'] = $appSettings['school_logo']; // Also update school_info
            }
        }

        \Log::info('App Settings for Report Card: ' . json_encode($appSettings));

        // Prepare comprehensive data for PDF
        $data = [
            'student' => $student->load(['user', 'classroom']),
            'term' => $term->load('academicSession'),
            'results' => $results->map(function($result) {
                $gradeInfo = $this->calculateGrade($result->total_score);
                $result->grade_info = $gradeInfo;
                return $result;
            }),
            'statistics' => [
                'total_score' => $totalScore,
                'average_score' => round($averageScore, 2),
                'highest_score' => $highestScore,
                'lowest_score' => $lowestScore,
                'total_subjects' => $results->count(),
                'gpa' => $gpa,
                'position' => $termResult->position,
                'total_students' => $classStats['total_students']
            ],
            'class_statistics' => $classStats,
            'attendance' => $attendanceData,
            'comments' => $comments,
            'grading_scale' => $gradingScale,
            'school_info' => $schoolInfo,
            'app_settings' => $appSettings, // Add this for styling
            'generated_on' => now()->format('d/m/Y H:i'),
            'academic_session' => $term->academicSession
        ];

        // Generate PDF with A4 format
        $pdf = PDF::loadView('reports.report-card', $data)
            ->setPaper('A4', 'portrait')
            ->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
                'defaultFont' => 'sans-serif'
            ]);

        return $pdf;
    }

    private function getClassStatistics($termId, $classroomId)
    {
        $classResults = Result::where('term_id', $termId)
            ->whereHas('student', function($query) use ($classroomId) {
                $query->where('classroom_id', $classroomId);
            })
            ->get();

        $studentAverages = $classResults->groupBy('student_id')
            ->map(function($studentResults) {
                return $studentResults->avg('total_score');
            });

        return [
            'total_students' => $studentAverages->count(),
            'class_average' => round($studentAverages->avg(), 2),
            'highest_average' => round($studentAverages->max(), 2),
            'lowest_average' => round($studentAverages->min(), 2)
        ];
    }

    private function getAttendanceData($studentId, $termId)
    {
        // Get real attendance data from the database
        $summary = \App\Models\Attendance::getAttendanceSummary($studentId, $termId);
        
        // If no attendance data exists, return default values
        if ($summary['total_days'] === 0) {
            return [
                'days_present' => 0,
                'days_absent' => 0,
                'total_days' => 0,
                'attendance_percentage' => 0
            ];
        }
        
        return $summary;
    }

    private function getComments($termResult)
    {
        return [
            'class_teacher' => $termResult->teacher_comment ?? 'Good performance. Keep up the excellent work.',
            'principal' => $termResult->principal_comment ?? 'Continue to strive for excellence in all subjects.',
        ];
    }

    private function getGradingScale()
    {
        return [
            ['grade' => 'A+', 'range' => '90-100', 'remark' => 'Outstanding'],
            ['grade' => 'A', 'range' => '80-89', 'remark' => 'Excellent'],
            ['grade' => 'B+', 'range' => '70-79', 'remark' => 'Very Good'],
            ['grade' => 'B', 'range' => '60-69', 'remark' => 'Good'],
            ['grade' => 'C+', 'range' => '50-59', 'remark' => 'Fair'],
            ['grade' => 'C', 'range' => '45-49', 'remark' => 'Satisfactory'],
            ['grade' => 'D', 'range' => '40-44', 'remark' => 'Pass'],
            ['grade' => 'F', 'range' => '0-39', 'remark' => 'Fail']
        ];
    }
}
