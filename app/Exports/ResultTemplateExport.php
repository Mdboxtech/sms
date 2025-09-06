<?php

namespace App\Exports;

use App\Models\Student;
use App\Models\Subject;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ResultTemplateExport implements FromCollection, WithHeadings, WithMapping
{
    protected $termId;

    public function __construct($termId)
    {
        $this->termId = $termId;
    }

    public function collection()
    {
        // Get students with classrooms, or return empty collection with sample data if none exist
        $students = Student::with(['user', 'classroom'])
            ->whereHas('classroom')
            ->get();
            
        // Get all subjects, or create sample ones if none exist
        $subjects = Subject::all();
        
        if ($students->isEmpty() || $subjects->isEmpty()) {
            // Return sample data if no students or subjects exist
            return collect([
                [
                    'student' => (object)[
                        'admission_number' => 'STU001',
                        'user' => (object)['name' => 'John Doe'],
                        'classroom' => (object)['name' => 'JSS 1A']
                    ],
                    'subject' => (object)['name' => 'Mathematics']
                ],
                [
                    'student' => (object)[
                        'admission_number' => 'STU001',
                        'user' => (object)['name' => 'John Doe'],
                        'classroom' => (object)['name' => 'JSS 1A']
                    ],
                    'subject' => (object)['name' => 'English Language']
                ],
                [
                    'student' => (object)[
                        'admission_number' => 'STU002',
                        'user' => (object)['name' => 'Jane Smith'],
                        'classroom' => (object)['name' => 'JSS 1B']
                    ],
                    'subject' => (object)['name' => 'Mathematics']
                ]
            ]);
        }
        
        return $students
            ->crossJoin($subjects)
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
            'Class',
            'Subject',
            'CA Score',
            'Exam Score',
            'Remark',
        ];
    }

    public function map($row): array
    {
        return [
            $row['student']->admission_number,
            $row['student']->user->name,
            $row['student']->classroom->name,
            $row['subject']->name,
            '', // CA Score to be filled
            '', // Exam Score to be filled
            '', // Remark to be filled (optional)
        ];
    }
}
