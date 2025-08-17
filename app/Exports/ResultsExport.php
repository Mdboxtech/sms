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
        $query = Result::with(['student.user', 'student.classroom', 'subject', 'term.academicSession']);
        
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
        
        return $query->get();
    }

    public function headings(): array
    {
        return [
            'Student Name',
            'Subject',
            'Term',
            'Academic Session',
            'CA Score',
            'Exam Score',
            'Total Score',
            'Grade',
            'Remark'
        ];
    }

    public function map($result): array
    {
        return [
            $result->student->user->name ?? 'Unknown Student',
            $result->subject->name ?? 'Unknown Subject',
            $result->term->name ?? 'Unknown Term',
            $result->term->academicSession->name ?? 'Unknown Session',
            $result->ca_score,
            $result->exam_score,
            $result->total_score,
            $this->getGrade($result->total_score),
            $result->remark ?? ''
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
