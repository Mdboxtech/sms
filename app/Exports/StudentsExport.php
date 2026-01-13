<?php

namespace App\Exports;

use App\Models\Student;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StudentsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Student::with(['user', 'classroom'])
            ->when($this->filters['classroom_id'] ?? null, function ($query, $classroomId) {
                $query->where('classroom_id', $classroomId);
            })
            ->when($this->filters['gender'] ?? null, function ($query, $gender) {
                $query->where('gender', $gender);
            })
            ->when($this->filters['search'] ?? null, function ($query, $search) {
                $query->where(function($subQuery) use ($search) {
                    $subQuery->whereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                                  ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhere('admission_number', 'like', "%{$search}%")
                    ->orWhere('parent_name', 'like', "%{$search}%")
                    ->orWhere('parent_phone', 'like', "%{$search}%");
                });
            });

        return $query->orderBy('admission_number')->get();
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
            'Address',
            'Status',
            'Created At'
        ];
    }

    public function map($student): array
    {
        return [
            $student->admission_number,
            $student->user->name,
            $student->user->email,
            $student->classroom->name,
            $student->date_of_birth ? $student->date_of_birth->format('Y-m-d') : '',
            ucfirst($student->gender),
            $student->parent_name,
            $student->parent_phone,
            $student->address,
            $student->user->email_verified_at ? 'Active' : 'Pending',
            $student->created_at->format('Y-m-d H:i:s')
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Style the header row
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF']
                ],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4A90E2']
                ]
            ],
        ];
    }
}
