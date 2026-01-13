<?php

namespace Tests\Feature\Teacher;

use App\Models\User;
use App\Models\Role;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Classroom;
use App\Models\Term;
use App\Models\Result;
use App\Models\AcademicSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class TeacherWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected $teacher;
    protected $student;
    protected $subject;
    protected $term;
    protected $classroom;
    protected $teacherUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(); // Seed roles

        // Create teacher user
        $this->teacherUser = User::factory()->create([
            'role_id' => Role::where('name', 'teacher')->first()->id
        ]);

        // Create teacher profile
        $this->teacher = Teacher::factory()->create([
            'user_id' => $this->teacherUser->id
        ]);

        // Create classroom and subject
        $this->classroom = Classroom::factory()->create();
        $this->subject = Subject::factory()->create();

        // Create student in the classroom
        $studentUser = User::factory()->create(['role_id' => Role::where('name', 'student')->first()->id]);
        $this->student = Student::factory()->create([
            'user_id' => $studentUser->id,
            'classroom_id' => $this->classroom->id
        ]);

        // Create term
        $session = AcademicSession::factory()->create(['is_current' => true]);
        $this->term = Term::factory()->create([
            'academic_session_id' => $session->id,
            'is_current' => true
        ]);
    }

    /** @test */
    public function it_redirects_root_teacher_url_to_dashboard()
    {
        $response = $this->actingAs($this->teacherUser)
            ->get('/teacher');

        $response->assertRedirect('/teacher/dashboard');
    }

    /** @test */
    public function class_teacher_can_enter_results_for_subject_not_directly_assigned()
    {
        // Setup:
        // 1. Teacher is assigned to the classroom (Class Teacher)
        $this->teacher->classrooms()->attach($this->classroom->id);
        
        // 2. Subject is assigned to the classroom (Available Subject)
        $this->classroom->subjects()->attach($this->subject->id);

        // 3. Teacher is NOT assigned to the subject directly
        // (Implicit by not attaching)

        $response = $this->actingAs($this->teacherUser)
            ->post(route('teacher.results.store'), [
                'student_id' => $this->student->id,
                'subject_id' => $this->subject->id,
                'term_id' => $this->term->id,
                'ca_score' => 30,
                'exam_score' => 50,
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(); // Should redirect to index or back with success

        $this->assertDatabaseHas('results', [
            'student_id' => $this->student->id,
            'subject_id' => $this->subject->id,
            'total_score' => 80
        ]);
    }

    /** @test */
    public function non_class_teacher_cannot_enter_results_for_unassigned_subject()
    {
        // Setup:
        // Teacher is NOT assigned to classroom
        // Teacher is NOT assigned to subject
        
        $response = $this->actingAs($this->teacherUser)
            ->post(route('teacher.results.store'), [
                'student_id' => $this->student->id,
                'subject_id' => $this->subject->id, // Unassigned
                'term_id' => $this->term->id,
                'ca_score' => 30,
                'exam_score' => 50,
            ]);

        $response->assertSessionHasErrors(['subject_id']);
    }

    /** @test */
    public function teacher_results_page_displays_results_correctly()
    {
        // Create a result owned by the teacher
        $result = Result::create([
            'student_id' => $this->student->id,
            'subject_id' => $this->subject->id,
            'term_id' => $this->term->id,
            'teacher_id' => $this->teacherUser->id,
            'ca_score' => 40,
            'exam_score' => 40,
            'total_score' => 80
        ]);

        // Assign teacher to classroom to ensure they can see the results
        $this->teacher->classrooms()->attach($this->classroom->id);
        $this->classroom->subjects()->attach($this->subject->id);

        $response = $this->actingAs($this->teacherUser)
            ->get(route('teacher.results.index'));

        $response->assertOk();
        
        // Assert Inertia response structure and data
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Teacher/Results/Index')
            ->has('results.data', 1)
            ->where('results.data.0.id', $result->id)
            ->where('results.data.0.total_score', 80)
            // Verify nested data structure needed for the DataTable
            ->where('results.data.0.student.user.name', $this->student->user->name)
            ->where('results.data.0.subject.name', $this->subject->name)
        );
    }

    /** @test */
    public function class_teacher_can_edit_result_for_assigned_class()
    {
        // Setup: Teacher as Class Teacher, subject in class, but not directly assigned
        $this->teacher->classrooms()->attach($this->classroom->id);
        $this->classroom->subjects()->attach($this->subject->id);

        $result = Result::create([
            'student_id' => $this->student->id,
            'subject_id' => $this->subject->id,
            'term_id' => $this->term->id,
            'teacher_id' => $this->teacherUser->id, // Created by this teacher
            'ca_score' => 40,
            'exam_score' => 40,
            'total_score' => 80
        ]);

        $response = $this->actingAs($this->teacherUser)
            ->get(route('teacher.results.edit', $result->id));

        $response->assertOk(); // Should not be 403
    }

    /** @test */
    public function teacher_can_edit_result_after_losing_permission()
    {
        // Setup: Initially valid permissions
        $this->teacher->classrooms()->attach($this->classroom->id);
        $this->classroom->subjects()->attach($this->subject->id);

        $result = Result::create([
            'student_id' => $this->student->id,
            'subject_id' => $this->subject->id,
            'term_id' => $this->term->id,
            'teacher_id' => $this->teacherUser->id,
            'ca_score' => 40,
            'exam_score' => 40,
            'total_score' => 80
        ]);

        // Permission lost: Subject removed from class
        $this->classroom->subjects()->detach($this->subject->id);

        // Try to edit
        $response = $this->actingAs($this->teacherUser)
            ->get(route('teacher.results.edit', $result->id));

        $response->assertOk(); 
    }

    /** @test */
    public function class_teacher_can_edit_result_when_subject_not_in_class_structure()
    {
        // Setup: Teacher is Class Teacher
        $this->teacher->classrooms()->attach($this->classroom->id);
        
        // Subject is NOT attached to classroom intentionally

        // Result created by ANOTHER teacher
        $otherTeacher = Teacher::factory()->create();
        $otherTeacherUser = \App\Models\User::factory()->create();
        $otherTeacher->user_id = $otherTeacherUser->id;
        $otherTeacher->save();
        
        $result = Result::create([
            'student_id' => $this->student->id,
            'subject_id' => $this->subject->id,
            'term_id' => $this->term->id,
            'teacher_id' => $otherTeacherUser->id,
            'ca_score' => 45,
            'exam_score' => 45,
            'total_score' => 90
        ]);

        // Try to edit as Class Teacher
        $response = $this->actingAs($this->teacherUser)
            ->get(route('teacher.results.edit', $result->id));

        $response->assertOk(); 
    }
    /** @test */
    public function class_teacher_can_fetch_students_and_subjects()
    {
        // Setup: Teacher is Class Teacher
        $this->teacher->classrooms()->attach($this->classroom->id);
        
        // Ensure classroom has students
        $student = \App\Models\Student::factory()->create([
            'classroom_id' => $this->classroom->id
        ]);
        
        // Ensure classroom has subjects
        $this->classroom->subjects()->attach($this->subject->id);

        $response = $this->actingAs($this->teacherUser)
            ->get(route('teacher.results.classroom.students', ['classroom' => $this->classroom->id]));

        $response->assertOk()
            ->assertJsonStructure(['students', 'subjects']);
            
        // Assert subject is returned (since Class Teacher manages all subjects in class)
        $this->assertTrue(collect($response->json('subjects'))->contains('id', $this->subject->id));
    }
}
