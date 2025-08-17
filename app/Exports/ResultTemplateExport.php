<?php

namespace App\Exports;

use App\Models\Student;
use App\Models\Subject;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStandardization;

class ResultTemplateExport implements FromCollection, WithHeadings, WithMapping, WithStandardization
{
    protected $termId;

    public function __construct($termId)
    {
        $this->termId = $termId;
    }

    public function collection()
    {
        return Student::with('user')
            ->whereHas('classroom')
            ->get()
            ->crossJoin(Subject::all())
            ->map(function ($pair) {
                return [
                    'student' => $pair[0],
                    'subject' => $pair[1],
                ];
            });
    }

    public function headings(): array
    {
        return [
            'Student ID',
            'Student Name',
            'Subject ID',
            'Subject Name',
            'CA Score (max: 40)',
            'Exam Score (max: 60)',
            'Term ID',
        ];
    }

    public function map($row): array
    {
        return [
            $row['student']->id,
            $row['student']->user->name,
            $row['subject']->id,
            $row['subject']->name,
            '', // CA Score to be filled
            '', // Exam Score to be filled
            $this->termId,
        ];
    }

    public function standardize($value)
    {
        if (is_numeric($value)) {
            return [
                'Student ID' => fn($value) => (int) $value,
                'Subject ID' => fn($value) => (int) $value,
                'Term ID' => fn($value) => (int) $value,
                'CA Score (max: 40)' => fn($value) => min(40, max(0, (float) $value)),
                'Exam Score (max: 60)' => fn($value) => min(60, max(0, (float) $value)),
            ];
        }
        return $value;
    }
}
