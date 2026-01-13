<?php

namespace App\Policies;

use App\Models\Result;
use App\Models\User;
use App\Services\ClassTeacherService;
use Illuminate\Auth\Access\HandlesAuthorization;

class ResultPolicy
{
    use HandlesAuthorization;

    protected $classTeacherService;

    public function __construct(ClassTeacherService $classTeacherService)
    {
        $this->classTeacherService = $classTeacherService;
    }

    /**
     * Determine whether the user can view any results.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role->name ?? '', ['admin', 'teacher', 'student']);
    }

    /**
     * Determine whether the user can view the result.
     */
    public function view(User $user, Result $result): bool
    {
        // Admin can view all results
        if ($user->role?->name === 'admin') {
            return true;
        }

        // Teacher can view results based on subject assignment OR class assignment
        if ($user->role?->name === 'teacher') {
            // Allow if teacher created the result
            if ($result->teacher_id === $user->id) {
                return true;
            }

            $teacher = $user->teacher;
            if ($teacher) {
                // Check specific subject permission first
                if ($this->classTeacherService->canTeacherManageSubjectResult(
                    $teacher->id,
                    $result->subject_id,
                    $result->student_id
                )) {
                    return true;
                }

                // Fallback: Allow Class Teacher to view any result for their student
                return $this->classTeacherService->canTeacherManageStudentResults($teacher->id, $result->student_id);
            }
        }

        // Student can view only their own results
        if ($user->role?->name === 'student') {
            return $user->student && 
                   $user->student->id === $result->student_id;
        }

        return false;
    }

    /**
     * Determine whether the user can create results.
     */
    public function create(User $user): bool
    {
        return in_array($user->role?->name ?? '', ['admin', 'teacher']);
    }

    /**
     * Determine whether the user can create a result for a specific student and subject.
     */
    public function createForStudentSubject(User $user, $studentId, $subjectId): bool
    {
        // Admin can create any result
        if ($user->role?->name === 'admin') {
            return true;
        }

        // Teachers can create results based on subject or class assignment
        if ($user->role?->name === 'teacher') {
            $teacher = $user->teacher;
            if ($teacher) {
                return $this->classTeacherService->canTeacherManageSubjectResult(
                    $teacher->id,
                    $subjectId,
                    $studentId
                );
            }
        }

        return false;
    }

    /**
     * Determine whether the user can update the result.
     */
    /**
     * Determine whether the user can update the result.
     */
    public function update(User $user, Result $result): bool
    {
        // Admin can update all results
        if ($user->role?->name === 'admin') {
            return true;
        }

        // Teacher can update results based on subject assignment OR class assignment
        if ($user->role?->name === 'teacher') {
            // Allow if teacher created the result
            if ((int)$result->teacher_id === (int)$user->id) {
                return true;
            }

            $teacher = $user->teacher;
            if ($teacher) {
                // Check specific subject permission first
                if ($this->classTeacherService->canTeacherManageSubjectResult(
                    $teacher->id,
                    $result->subject_id,
                    $result->student_id
                )) {
                    return true;
                }

                // Fallback: Allow Class Teacher to update any result for their student
                // This covers cases where subject assignment might have changed or is not strictly mapped
                return $this->classTeacherService->canTeacherManageStudentResults($teacher->id, $result->student_id);
            }
        }

        return false;
    }

    /**
     * Determine whether the user can delete the result.
     */
    public function delete(User $user, Result $result): bool
    {
        // Only admin can delete results
        if ($user->role?->name === 'admin') {
            return true;
        }

        // Teacher can delete results they created
        if ($user->role?->name === 'teacher') {
            if ((int)$result->teacher_id === (int)$user->id) {
                return true;
            }

            $teacher = $user->teacher;
            if ($teacher) {
                 if ($this->classTeacherService->canTeacherManageSubjectResult(
                    $teacher->id,
                    $result->subject_id,
                    $result->student_id
                )) {
                    return true;
                }
                
                return $this->classTeacherService->canTeacherManageStudentResults($teacher->id, $result->student_id);
            }
        }

        return false;
    }

    /**
     * Determine whether the user can add comments to the result.
     */
    public function comment(User $user, Result $result): bool
    {
        // Admin can comment on any result
        if ($user->role?->name === 'admin') {
            return true;
        }

        // Teachers can comment on results they can manage
        if ($user->role?->name === 'teacher') {
            $teacher = $user->teacher;
            if ($teacher) {
                return $this->classTeacherService->canTeacherManageSubjectResult(
                    $teacher->id,
                    $result->subject_id,
                    $result->student_id
                );
            }
        }

        return false;
    }

    /**
     * Determine whether the user can manage results for a specific classroom.
     */
    public function manageClassroomResults(User $user, $classroomId): bool
    {
        // Admin can manage all classroom results
        if ($user->role?->name === 'admin') {
            return true;
        }

        // Teachers can manage results for classrooms they're assigned to
        if ($user->role?->name === 'teacher') {
            return $this->classTeacherService->canCurrentUserManageClassResults($classroomId);
        }

        return false;
    }

    /**
     * Determine whether the user can bulk create results.
     */
    public function bulkCreate(User $user): bool
    {
        return in_array($user->role?->name ?? '', ['admin', 'teacher']);
    }

    /**
     * Determine whether the user can compile results.
     */
    public function compile(User $user, $classroomId = null): bool
    {
        // Admin can compile all results
        if ($user->role?->name === 'admin') {
            return true;
        }

        // If no specific classroom, deny for teachers
        if (!$classroomId) {
            return false;
        }

        // Teachers can compile results for their assigned classrooms
        return $this->manageClassroomResults($user, $classroomId);
    }

    /**
     * Determine whether the user can export results.
     */
    public function export(User $user, $classroomId = null): bool
    {
        // Admin can export any results
        if ($user->role?->name === 'admin') {
            return true;
        }

        // If no specific classroom, deny for teachers
        if (!$classroomId) {
            return false;
        }

        // Teachers can export results for their assigned classrooms
        return $this->manageClassroomResults($user, $classroomId);
    }

    /**
     * Determine whether the user can import results.
     */
    public function import(User $user, $classroomId = null): bool
    {
        return $this->export($user, $classroomId);
    }

    /**
     * Determine whether the user can add comments to results.
     * This method is kept for backward compatibility but now uses the comment method
     */
    public function addComments(User $user, Result $result): bool
    {
        return $this->comment($user, $result);
    }
}
