<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Teacher extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'employee_id',
        'qualification',
        'date_joined',
        'phone',
        'address'
    ];

    protected $casts = [
        'date_joined' => 'date'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'teacher_subjects');
    }

    public function classrooms(): BelongsToMany
    {
        return $this->belongsToMany(Classroom::class, 'classroom_teachers');
    }

    // CBT Relationships
    public function createdExams()
    {
        return $this->hasMany(Exam::class, 'teacher_id');
    }

    public function createdQuestions()
    {
        return $this->hasMany(Question::class, 'teacher_id');
    }

    public function getManageableExams()
    {
        // Get exams for subjects the teacher is assigned to
        $subjectIds = $this->subjects()->pluck('subjects.id');
        
        return Exam::whereIn('subject_id', $subjectIds)
            ->orWhere('teacher_id', $this->user_id)
            ->with(['subject', 'questions'])
            ->get();
    }

    public function canManageExam(Exam $exam): bool
    {
        // Teacher can manage exam if they created it or if it's for their subject
        return $exam->teacher_id === $this->user_id || 
               $this->subjects()->where('subjects.id', $exam->subject_id)->exists();
    }
}
