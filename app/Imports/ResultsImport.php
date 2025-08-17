<?php

namespace App\Imports;

use App\Models\Result;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class ResultsImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        return new Result([
            'student_id' => $row['student_id'],
            'subject_id' => $row['subject_id'],
            'term_id' => $row['term_id'],
            'ca_score' => $row['ca_score'],
            'exam_score' => $row['exam_score'],
            'total_score' => $row['ca_score'] + $row['exam_score'],
            'teacher_id' => Auth::id(),
        ]);
    }

    public function rules(): array
    {
        return [
            'student_id' => 'required|exists:students,id',
            'subject_id' => 'required|exists:subjects,id',
            'term_id' => 'required|exists:terms,id',
            'ca_score' => 'required|numeric|min:0|max:40',
            'exam_score' => 'required|numeric|min:0|max:60',
        ];
    }
}
