<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Classroom extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'section',
        'description',
    ];

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class)
            ->withTimestamps();
    }

    public function teachers()
    {
        return $this->belongsToMany(Teacher::class, 'classroom_teachers')
            ->withTimestamps();
    }

    // Attendance Relationship
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
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

    public function getScheduledExams($termId = null)
    {
        $query = $this->examSchedules()->with(['exam.subject', 'exam.teacher']);
        
        if ($termId) {
            $query->where('term_id', $termId);
        }
        
        return $query->upcoming()->get();
    }

    public function getPublishedTimetables($termId = null)
    {
        $query = $this->examTimetables()->published();
        
        if ($termId) {
            $query->where('term_id', $termId);
        }
        
        return $query->orderBy('exam_date')->get();
    }
}
