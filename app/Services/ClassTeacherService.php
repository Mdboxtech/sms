<?php

namespace App\Services;

use App\Models\Teacher;
use App\Models\User;
use App\Models\Classroom;
use App\Models\Subject;
use App\Models\Result;
use Illuminate\Support\Facades\Auth;

/**
 * Service to handle class-based teacher permissions and operations
 * 
 * This service implements the logic where teachers assigned to a class
 * can manage results for all subjects in that class, even if they're
 * not specifically assigned to those subjects.
 */
class ClassTeacherService
{
    /**
     * Check if a teacher is assigned to a specific classroom
     */
    public function isTeacherAssignedToClass($teacherId, $classroomId): bool
    {
        return Teacher::where('id', $teacherId)
            ->whereHas('classrooms', function ($query) use ($classroomId) {
                $query->where('classroom_id', $classroomId);
            })
            ->exists();
    }

    /**
     * Check if a user (by user_id) is assigned to a specific classroom as a teacher
     */
    public function isUserAssignedToClassAsTeacher($userId, $classroomId): bool
    {
        return Teacher::whereHas('user', function ($query) use ($userId) {
                $query->where('id', $userId);
            })
            ->whereHas('classrooms', function ($query) use ($classroomId) {
                $query->where('classroom_id', $classroomId);
            })
            ->exists();
    }

    /**
     * Get all classrooms assigned to a teacher
     */
    public function getTeacherClassrooms($teacherId)
    {
        $teacher = Teacher::with('classrooms')->find($teacherId);
        return $teacher ? $teacher->classrooms : collect();
    }

    /**
     * Get all classrooms assigned to a user (as teacher)
     */
    public function getUserClassrooms($userId)
    {
        $teacher = Teacher::with('classrooms')
            ->whereHas('user', function ($query) use ($userId) {
                $query->where('id', $userId);
            })
            ->first();
            
        return $teacher ? $teacher->classrooms : collect();
    }

    /**
     * Get all subjects available in a classroom
     */
    public function getClassroomSubjects($classroomId)
    {
        $classroom = Classroom::with('subjects')->find($classroomId);
        return $classroom ? $classroom->subjects : collect();
    }

    /**
     * Check if a teacher can manage results for a specific student
     * This includes both subject-based and class-based permissions
     */
    public function canTeacherManageStudentResults($teacherId, $studentId): bool
    {
        $teacher = Teacher::find($teacherId);
        if (!$teacher) {
            return false;
        }

        // Get student's classroom
        $student = \App\Models\Student::with('classroom')->find($studentId);
        if (!$student || !$student->classroom) {
            return false;
        }

        // Check if teacher is assigned to the student's class
        return $this->isTeacherAssignedToClass($teacherId, $student->classroom_id);
    }

    /**
     * Check if a teacher can manage results for a specific subject and student
     * This combines subject assignment and class assignment logic
     */
    public function canTeacherManageSubjectResult($teacherId, $subjectId, $studentId): bool
    {
        $teacher = Teacher::find($teacherId);
        if (!$teacher) {
            return false;
        }

        // Method 1: Direct subject assignment
        $hasSubjectAssignment = $teacher->subjects()->where('subject_id', $subjectId)->exists();
        
        if ($hasSubjectAssignment) {
            return true;
        }

        // Method 2: Class-based assignment
        $student = \App\Models\Student::with('classroom')->find($studentId);
        if (!$student || !$student->classroom) {
            return false;
        }

        // Check if teacher is assigned to the student's class
        $isClassTeacher = $this->isTeacherAssignedToClass($teacherId, $student->classroom_id);
        
        if (!$isClassTeacher) {
            return false;
        }

        // Check if the subject is taught in this classroom
        $subjectInClass = $student->classroom->subjects()->where('subject_id', $subjectId)->exists();
        
        return $subjectInClass;
    }

    /**
     * Get the permission type for a teacher's access to a subject/student result
     * Returns: 'subject_assignment', 'class_assignment', or null
     */
    public function getTeacherPermissionType($teacherId, $subjectId, $studentId): ?string
    {
        $teacher = Teacher::find($teacherId);
        if (!$teacher) {
            return null;
        }

        // Check direct subject assignment first
        if ($teacher->subjects()->where('subject_id', $subjectId)->exists()) {
            return 'subject_assignment';
        }

        // Check class-based assignment
        $student = \App\Models\Student::with('classroom')->find($studentId);
        if ($student && $student->classroom) {
            $isClassTeacher = $this->isTeacherAssignedToClass($teacherId, $student->classroom_id);
            $subjectInClass = $student->classroom->subjects()->where('subject_id', $subjectId)->exists();
            
            if ($isClassTeacher && $subjectInClass) {
                return 'class_assignment';
            }
        }

        return null;
    }

    /**
     * Get all subjects a teacher can manage for a specific classroom
     * This includes both assigned subjects and class-based subjects
     */
    public function getTeacherManageableSubjects($teacherId, $classroomId)
    {
        $teacher = Teacher::with('subjects')->find($teacherId);
        if (!$teacher) {
            return collect();
        }

        // Get teacher's directly assigned subjects
        $assignedSubjects = $teacher->subjects;

        // If teacher is assigned to this class, add all classroom subjects
        if ($this->isTeacherAssignedToClass($teacherId, $classroomId)) {
            $classroomSubjects = $this->getClassroomSubjects($classroomId);
            
            // Merge and remove duplicates
            $allSubjects = $assignedSubjects->merge($classroomSubjects)->unique('id');
            
            return $allSubjects->map(function ($subject) use ($assignedSubjects) {
                $subject->permission_type = $assignedSubjects->contains('id', $subject->id) 
                    ? 'subject_assignment' 
                    : 'class_assignment';
                return $subject;
            });
        }

        // If not a class teacher, return only assigned subjects
        return $assignedSubjects->map(function ($subject) {
            $subject->permission_type = 'subject_assignment';
            return $subject;
        });
    }

    /**
     * Check if current authenticated user can manage results for a classroom
     */
    public function canCurrentUserManageClassResults($classroomId): bool
    {
        $user = Auth::user();
        if (!$user) {
            return false;
        }

        // Admin can manage all
        if ($user->role && $user->role->name === 'admin') {
            return true;
        }

        // Check if user is a teacher assigned to this class
        return $this->isUserAssignedToClassAsTeacher($user->id, $classroomId);
    }

    /**
     * Get detailed permission information for a teacher
     */
    public function getTeacherPermissionSummary($teacherId): array
    {
        $teacher = Teacher::with(['subjects', 'classrooms.subjects'])->find($teacherId);
        if (!$teacher) {
            return [];
        }

        $summary = [
            'teacher_id' => $teacherId,
            'direct_subjects' => $teacher->subjects->count(),
            'assigned_classes' => $teacher->classrooms->count(),
            'class_based_subjects' => 0,
            'total_manageable_subjects' => 0,
            'classes' => []
        ];

        $allManageableSubjects = collect();

        foreach ($teacher->classrooms as $classroom) {
            $classroomSubjects = $classroom->subjects;
            $summary['classes'][] = [
                'classroom_id' => $classroom->id,
                'classroom_name' => $classroom->name,
                'subjects_count' => $classroomSubjects->count(),
                'subjects' => $classroomSubjects->pluck('name', 'id')->toArray()
            ];

            $allManageableSubjects = $allManageableSubjects->merge($classroomSubjects);
        }

        // Add directly assigned subjects
        $allManageableSubjects = $allManageableSubjects->merge($teacher->subjects);

        $summary['class_based_subjects'] = $teacher->classrooms->sum(function ($classroom) {
            return $classroom->subjects->count();
        });
        
        $summary['total_manageable_subjects'] = $allManageableSubjects->unique('id')->count();

        return $summary;
    }
}
