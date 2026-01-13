<?php

namespace App\Exports;

use App\Models\Result;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class ResultsExport implements FromCollection, WithHeadings, WithMapping, WithTitle
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Result::with(['student.user', 'student.classroom', 'subject', 'term.academicSession', 'teacher']);
        
        // Apply filters
        if (!empty($this->filters['term_id'])) {
            $query->where('term_id', $this->filters['term_id']);
        }
        
        if (!empty($this->filters['subject_id'])) {
            $query->where('subject_id', $this->filters['subject_id']);
        }
        
        if (!empty($this->filters['classroom_id'])) {
            $query->whereHas('student', function($q) {
                $q->where('classroom_id', $this->filters['classroom_id']);
            });
        }

        if (!empty($this->filters['teacher_id'])) {
            $query->where('teacher_id', $this->filters['teacher_id']);
        }

        if (!empty($this->filters['min_score'])) {
            $query->where('total_score', '>=', $this->filters['min_score']);
        }

        if (!empty($this->filters['max_score'])) {
            $query->where('total_score', '<=', $this->filters['max_score']);
        }
        
        return $query->orderBy('created_at', 'desc')->get();
    }

    public function headings(): array
    {
        return [
            'Student Name',
            'Admission Number',
            'Class',
            'Subject',
            'Subject Code',
            'Term',
            'Academic Session',
            'Teacher',
            'CA Score',
            'Exam Score',
            'Total Score',
            'Grade',
            'Status',
            'Remark',
            'Created Date'
        ];
    }

    public function map($result): array
    {
        return [
            $result->student->user->name ?? 'Unknown Student',
            $result->student->admission_number ?? 'N/A',
            $result->student->classroom->name ?? 'Not Assigned',
            $result->subject->name ?? 'Unknown Subject',
            $result->subject->code ?? 'N/A',
            $result->term->name ?? 'Unknown Term',
            $result->term->academicSession->name ?? 'Unknown Session',
            $result->teacher->name ?? 'N/A',
            $result->ca_score,
            $result->exam_score,
            $result->total_score,
            $this->getGrade($result->total_score),
            $result->total_score >= 40 ? 'Pass' : 'Fail',
            $result->remark ?? '',
            $result->created_at->format('Y-m-d H:i:s')
        ];
    }

    public function title(): string
    {
        return 'Results Report';
    }

    protected function getGrade($score)
    {
        if ($score >= 70) return 'A';
        if ($score >= 60) return 'B';
        if ($score >= 50) return 'C';
        if ($score >= 40) return 'D';
        return 'F';
    }
}
