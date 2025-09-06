<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Result extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'subject_id',
        'term_id',
        'ca_score',
        'exam_score',
        'total_score',
        'position',
        'remark',
        'teacher_id',
        'principal_id',
        'teacher_comment',
        'principal_comment',
        'cbt_exam_attempt_id',
        'is_cbt_exam',
        'manual_exam_score',
        'cbt_synced_at',
    ];

    protected $casts = [
        'ca_score' => 'decimal:2',
        'exam_score' => 'decimal:2',
        'total_score' => 'decimal:2',
        'manual_exam_score' => 'decimal:2',
        'position' => 'integer',
        'is_cbt_exam' => 'boolean',
        'cbt_synced_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'teacher_id', 'user_id');
    }

    public function principal(): BelongsTo
    {
        return $this->belongsTo(User::class, 'principal_id');
    }

    public function cbtExamAttempt(): BelongsTo
    {
        return $this->belongsTo(StudentExamAttempt::class, 'cbt_exam_attempt_id');
    }
    
    public function termResult(): BelongsTo
    {
        return $this->belongsTo(TermResult::class)->where([
            'student_id' => $this->student_id,
            'term_id' => $this->term_id
        ]);
    }
}
