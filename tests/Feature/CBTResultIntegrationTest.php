<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Subject;
use App\Models\Term;
use App\Models\Classroom;
use App\Models\AcademicSession;
use App\Models\Exam;
use App\Models\ExamSchedule;
use App\Models\StudentExamAttempt;
use App\Models\Result;
use App\Models\Role;
use App\Services\CBTResultIntegrationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CBTResultIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected $cbtIntegrationService;
    protected $student;
    protected $subject;
    protected $term;
    protected $classroom;
    protected $exam;
    protected $examSchedule;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->cbtIntegrationService = app(CBTResultIntegrationService::class);
        
        // Create test data
        $this->setupTestData();
    }

    protected function setupTestData()
    {
        // Create role first
        $studentRole = Role::factory()->create([
            'name' => 'student',
            'description' => 'Student role'
        ]);

        // Create academic session
        $academicSession = AcademicSession::factory()->create([
            'name' => '2024/2025',
            'is_current' => true
        ]);

        // Create classroom
        $this->classroom = Classroom::factory()->create([
            'name' => 'Grade 10A'
        ]);

        // Create term
        $this->term = Term::factory()->create([
            'name' => 'First Term',
            'academic_session_id' => $academicSession->id,
            'is_current' => true // Make sure this term is current
        ]);

        // Create subject
        $this->subject = Subject::factory()->create([
            'name' => 'Mathematics',
            'code' => 'MATH101'
        ]);

        // Create student
        $user = User::factory()->create([
            'email' => 'student@test.com',
            'name' => 'Test Student',
            'role_id' => $studentRole->id
        ]);
        
        $this->student = Student::factory()->create([
            'user_id' => $user->id,
            'classroom_id' => $this->classroom->id,
            'admission_number' => 'STU001'
        ]);

        // Create teacher for exam
        $teacherUser = User::factory()->create([
            'email' => 'teacher@test.com',
            'name' => 'Test Teacher',
            'role_id' => $studentRole->id // Using same role for simplicity
        ]);
        
        $teacher = Teacher::factory()->create([
            'user_id' => $teacherUser->id,
            'employee_id' => 'TCH001'
        ]);

        // Create exam manually since no factory exists
        $this->exam = Exam::create([
            'title' => 'Mathematics Mid-Term Test',
            'subject_id' => $this->subject->id,
            'teacher_id' => $teacher->id,
            'total_marks' => 100,
            'pass_mark' => 60,
            'duration' => 120,
            'instructions' => 'Test instructions',
            'status' => 'active',
            'created_by' => $user->id
        ]);

        // Create exam schedule manually
        $this->examSchedule = ExamSchedule::create([
            'exam_id' => $this->exam->id,
            'classroom_id' => $this->classroom->id,
            'term_id' => $this->term->id,
            'scheduled_date' => now()->addDay(),
            'start_time' => now()->addDay()->setTime(9, 0),
            'end_time' => now()->addDay()->setTime(11, 0),
            'status' => 'scheduled',
            'created_by' => $user->id
        ]);

        // Create existing result record
        Result::create([
            'student_id' => $this->student->id,
            'subject_id' => $this->subject->id,
            'term_id' => $this->term->id,
            'teacher_id' => $teacher->user_id, // Use teacher's user_id as it's constrained to users table
            'ca_score' => 20,
            'exam_score' => 0, // Set to 0 instead of null
            'total_score' => 20,
            'grade' => 'F',
            'is_cbt_exam' => false
        ]);
    }

    public function test_it_can_sync_cbt_score_to_result()
    {
        // Create a completed CBT attempt
        $cbtAttempt = StudentExamAttempt::create([
            'exam_schedule_id' => $this->examSchedule->id,
            'student_id' => $this->student->id,
            'start_time' => now()->subHour(),
            'end_time' => now(),
            'status' => 'completed',
            'total_score' => 85,
            'percentage' => 85,
            'time_taken' => 3600
        ]);

        // Sync CBT to result
        $result = $this->cbtIntegrationService->syncCBTToResult($cbtAttempt);

        // Assert result was updated
        $this->assertNotNull($result);
        $this->assertEquals(51, $result->exam_score); // 85% of 60 = 51
        $this->assertEquals(71, $result->total_score); // 20 CA + 51 exam
        $this->assertTrue($result->is_cbt_exam);
        $this->assertEquals($cbtAttempt->id, $result->cbt_exam_attempt_id);
        $this->assertNotNull($result->cbt_synced_at);
    }

    public function test_it_can_override_cbt_score_manually()
    {
        // Create and sync CBT attempt
        $cbtAttempt = StudentExamAttempt::create([
            'exam_schedule_id' => $this->examSchedule->id,
            'student_id' => $this->student->id,
            'start_time' => now()->subHour(),
            'end_time' => now(),
            'status' => 'completed',
            'total_score' => 75,
            'percentage' => 75,
            'time_taken' => 3600
        ]);

        $result = $this->cbtIntegrationService->syncCBTToResult($cbtAttempt);
        
        // Override with manual score
        $success = $this->cbtIntegrationService->overrideCBTScore($result, 90);
        $result->refresh();

        // Assert manual override
        $this->assertTrue($success);
        $this->assertEquals(90, $result->exam_score);
        $this->assertEquals(90, $result->manual_exam_score);
        $this->assertEquals(110, $result->total_score); // 20 CA + 90 manual exam
    }

    public function test_observer_automatically_syncs_completed_cbt_attempts()
    {
        // Create in-progress CBT attempt
        $cbtAttempt = StudentExamAttempt::create([
            'exam_schedule_id' => $this->examSchedule->id,
            'student_id' => $this->student->id,
            'start_time' => now()->subHour(),
            'status' => 'in_progress',
            'total_score' => 0,
            'percentage' => 0
        ]);

        // Complete the attempt (should trigger observer)
        $cbtAttempt->update([
            'status' => 'completed',
            'end_time' => now(),
            'total_score' => 92,
            'percentage' => 92,
            'time_taken' => 3600
        ]);

        // Check if result was auto-synced
        $result = Result::where('student_id', $this->student->id)
            ->where('subject_id', $this->subject->id)
            ->where('term_id', $this->term->id)
            ->first();

        $this->assertEquals(55.2, $result->exam_score); // 92% of 60 = 55.2
        $this->assertTrue($result->is_cbt_exam);
        $this->assertEquals($cbtAttempt->id, $result->cbt_exam_attempt_id);
    }
}
