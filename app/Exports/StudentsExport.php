<?php

namespace App\Exports;

use App\Models\Student;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class StudentsExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Student::with(['user', 'classroom'])->get();
    }

    public function headings(): array
    {
        return [
            'Admission Number',
            'Name',
            'Email',
            'Class',
            'Date of Birth',
            'Gender',
            'Parent Name',
            'Parent Phone',
            'Address'
        ];
    }

    public function map($student): array
    {
        return [
            $student->admission_number,
            $student->user->name,
            $student->user->email,
            $student->classroom->name,
            $student->date_of_birth,
            $student->gender,
            $student->parent_name,
            $student->parent_phone,
            $student->address
        ];
    }
}
