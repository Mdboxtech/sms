<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Term extends Model
{
    use HasFactory;

    protected $fillable = [
        'academic_session_id',
        'name',
        'start_date',
        'end_date',
        'is_current',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_current' => 'boolean',
    ];

    public function academicSession(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class);
    }

    public function results(): HasMany
    {
        return $this->hasMany(Result::class);
    }

    // CBT Relationships
    public function examSchedules(): HasMany
    {
        return $this->hasMany(ExamSchedule::class);
    }

    public function examTimetables(): HasMany
    {
        return $this->hasMany(ExamTimetable::class);
    }

    public function getTermExams()
    {
        return $this->examSchedules()->with(['exam.subject', 'classroom'])->get();
    }

    public function getTermTimetables()
    {
        return $this->examTimetables()->with('classroom')->published()->get();
    }
}
