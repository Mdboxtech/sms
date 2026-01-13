<?php

namespace App\Imports;

use App\Models\Result;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class ResultsImport implements ToModel, WithHeadingRow, WithValidation
{
    protected $termId;

    public function __construct($termId = null)
    {
        $this->termId = $termId;
    }

    public function model(array $row)
    {
        // Skip empty rows
        if (empty($row['student_id']) && empty($row['subject'])) {
            return null;
        }

        // Find student by admission number or name
        $student = Student::where('admission_number', $row['student_id'])
            ->orWhereHas('user', function($q) use ($row) {
                $q->where('name', 'like', '%' . $row['student_id'] . '%');
            })
            ->first();
            
        if (!$student) {
            throw new \Exception("Student with identifier '{$row['student_id']}' not found");
        }

        // Find subject by name or code
        $subject = Subject::where('name', $row['subject'])
            ->orWhere('code', $row['subject'])
            ->first();
            
        if (!$subject) {
            throw new \Exception("Subject '{$row['subject']}' not found");
        }

        $caScore = (float) ($row['ca_score'] ?? 0);
        $examScore = (float) ($row['exam_score'] ?? 0);
        $totalScore = $caScore + $examScore;

        // Check if result already exists for this student, subject, and term
        $existingResult = Result::where([
            'student_id' => $student->id,
            'subject_id' => $subject->id,
            'term_id' => $this->termId,
        ])->first();

        if ($existingResult) {
            // Update existing result
            $existingResult->update([
                'ca_score' => $caScore,
                'exam_score' => $examScore,
                'total_score' => $totalScore,
                'remark' => $row['remark'] ?? $existingResult->remark,
                'updated_at' => now(),
            ]);
            return null; // Don't create new record
        }

        return new Result([
            'student_id' => $student->id,
            'subject_id' => $subject->id,
            'term_id' => $this->termId,
            'ca_score' => $caScore,
            'exam_score' => $examScore,
            'total_score' => $totalScore,
            'remark' => $row['remark'] ?? null,
            'teacher_id' => Auth::id(),
        ]);
    }

    public function rules(): array
    {
        return [
            'student_id' => 'required|string', // Admission number or name
            'subject' => 'required|string',    // Subject name or code
            'ca_score' => 'required|numeric|min:0|max:40',
            'exam_score' => 'required|numeric|min:0|max:60',
            'remark' => 'nullable|string|max:500',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'student_id.required' => 'Student ID/Admission Number is required',
            'subject.required' => 'Subject name is required',
            'ca_score.required' => 'CA Score is required',
            'ca_score.max' => 'CA Score cannot exceed 40',
            'exam_score.required' => 'Exam Score is required',
            'exam_score.max' => 'Exam Score cannot exceed 60',
        ];
    }
}
