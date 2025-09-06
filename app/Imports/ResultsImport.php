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
        // Find student by admission number
        $student = Student::where('admission_number', $row['student_id'])->first();
        if (!$student) {
            throw new \Exception("Student with admission number {$row['student_id']} not found");
        }

        // Find subject by name
        $subject = Subject::where('name', $row['subject'])->first();
        if (!$subject) {
            throw new \Exception("Subject {$row['subject']} not found");
        }

        return new Result([
            'student_id' => $student->id,
            'subject_id' => $subject->id,
            'term_id' => $this->termId,
            'ca_score' => $row['ca_score'],
            'exam_score' => $row['exam_score'],
            'total_score' => $row['ca_score'] + $row['exam_score'],
            'remark' => $row['remark'] ?? null,
            'teacher_id' => Auth::id(),
        ]);
    }

    public function rules(): array
    {
        return [
            'student_id' => 'required|string', // Admission number
            'subject' => 'required|string',    // Subject name
            'ca_score' => 'required|numeric|min:0|max:40',
            'exam_score' => 'required|numeric|min:0|max:60',
            'remark' => 'nullable|string|max:500',
        ];
    }
}
