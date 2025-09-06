<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'classroom_id',
        'academic_session_id',
        'term_id',
        'date',
        'status',
        'arrival_time',
        'notes',
        'marked_by',
        'marked_at',
        'updated_by',
    ];

    protected $casts = [
        'date' => 'date',
        'arrival_time' => 'datetime:H:i',
        'marked_at' => 'datetime',
    ];

    // Status constants for easy reference
    const STATUS_PRESENT = 'present';
    const STATUS_ABSENT = 'absent';
    const STATUS_LATE = 'late';
    const STATUS_EXCUSED = 'excused';

    public static function getStatusOptions()
    {
        return [
            self::STATUS_PRESENT => 'Present',
            self::STATUS_ABSENT => 'Absent',
            self::STATUS_LATE => 'Late',
            self::STATUS_EXCUSED => 'Excused',
        ];
    }

    /**
     * Relationships
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function academicSession(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class);
    }

    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
    }

    public function markedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'marked_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scopes for easy querying
     */
    public function scopeForStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeForClassroom($query, $classroomId)
    {
        return $query->where('classroom_id', $classroomId);
    }

    public function scopeForDate($query, $date)
    {
        return $query->where('date', $date);
    }

    public function scopeForTerm($query, $termId)
    {
        return $query->where('term_id', $termId);
    }

    public function scopeForSession($query, $sessionId)
    {
        return $query->where('academic_session_id', $sessionId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePresent($query)
    {
        return $query->where('status', self::STATUS_PRESENT);
    }

    public function scopeAbsent($query)
    {
        return $query->where('status', self::STATUS_ABSENT);
    }

    public function scopeLate($query)
    {
        return $query->where('status', self::STATUS_LATE);
    }

    /**
     * Helper methods
     */
    public function isPresent(): bool
    {
        return $this->status === self::STATUS_PRESENT;
    }

    public function isAbsent(): bool
    {
        return $this->status === self::STATUS_ABSENT;
    }

    public function isLate(): bool
    {
        return $this->status === self::STATUS_LATE;
    }

    public function isExcused(): bool
    {
        return $this->status === self::STATUS_EXCUSED;
    }

    /**
     * Get attendance percentage for a student in a term
     */
    public static function getAttendancePercentage($studentId, $termId, $sessionId = null)
    {
        $query = self::forStudent($studentId)->forTerm($termId);
        
        if ($sessionId) {
            $query->forSession($sessionId);
        }
        
        $totalDays = $query->count();
        $presentDays = $query->whereIn('status', [self::STATUS_PRESENT, self::STATUS_LATE])->count();
        
        return $totalDays > 0 ? round(($presentDays / $totalDays) * 100, 2) : 0;
    }

    /**
     * Get attendance summary for a student
     */
    public static function getAttendanceSummary($studentId, $termId, $sessionId = null)
    {
        $query = self::forStudent($studentId)->forTerm($termId);
        
        if ($sessionId) {
            $query->forSession($sessionId);
        }
        
        $total = $query->count();
        $present = $query->present()->count();
        $absent = $query->absent()->count();
        $late = $query->late()->count();
        $excused = $query->where('status', self::STATUS_EXCUSED)->count();
        
        return [
            'total_days' => $total,
            'days_present' => $present,
            'days_absent' => $absent,
            'days_late' => $late,
            'days_excused' => $excused,
            'attendance_percentage' => $total > 0 ? round((($present + $late) / $total) * 100, 2) : 0,
        ];
    }

    /**
     * Mark attendance for multiple students
     */
    public static function markBulkAttendance(array $attendanceData)
    {
        $results = [];
        
        foreach ($attendanceData as $data) {
            $attendance = self::updateOrCreate(
                [
                    'student_id' => $data['student_id'],
                    'date' => $data['date'],
                ],
                [
                    'classroom_id' => $data['classroom_id'],
                    'academic_session_id' => $data['academic_session_id'],
                    'term_id' => $data['term_id'],
                    'status' => $data['status'],
                    'arrival_time' => $data['arrival_time'] ?? null,
                    'notes' => $data['notes'] ?? null,
                    'marked_by' => $data['marked_by'],
                    'marked_at' => now(),
                    'updated_by' => $data['marked_by'],
                ]
            );
            
            $results[] = $attendance;
        }
        
        return $results;
    }
}
