<?php

namespace App\Exports;

use App\Models\Classroom;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class StudentsTemplateExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        // Return an empty collection with sample data for guidance
        return collect([
            [
                'admission_number' => 'STU001',
                'name' => 'John Doe',
                'email' => 'john.doe@example.com',
                'class_name' => 'JSS 1A',
                'date_of_birth' => '2010-01-15',
                'gender' => 'Male',
                'parent_name' => 'Jane Doe',
                'parent_phone' => '+234xxxxxxxxxx',
                'address' => '123 Main Street, Lagos'
            ],
            [
                'admission_number' => 'STU002',
                'name' => 'Mary Smith',
                'email' => 'mary.smith@example.com',
                'class_name' => 'JSS 1B',
                'date_of_birth' => '2010-03-22',
                'gender' => 'Female',
                'parent_name' => 'John Smith',
                'parent_phone' => '+234xxxxxxxxxx',
                'address' => '456 Oak Avenue, Abuja'
            ]
        ]);
    }

    public function headings(): array
    {
        return [
            'Admission Number',
            'Name',
            'Email',
            'Class',
            'Date of Birth (YYYY-MM-DD)',
            'Gender',
            'Parent Name',
            'Parent Phone',
            'Address'
        ];
    }

    public function map($row): array
    {
        return [
            $row['admission_number'],
            $row['name'],
            $row['email'],
            $row['class_name'],
            $row['date_of_birth'],
            $row['gender'],
            $row['parent_name'],
            $row['parent_phone'],
            $row['address']
        ];
    }
}
