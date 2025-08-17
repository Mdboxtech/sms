<?php

namespace Tests\Feature;

use App\Models\Result;
use App\Models\Student;
use App\Models\Term;
use App\Models\User;
use App\Models\Role;
use App\Models\Classroom;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\AcademicSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportCardTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $student;
    protected $term;
    protected $results = [];

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        $adminRole = Role::create(['name' => 'admin', 'description' => 'Administrator']);
        $studentRole = Role::create(['name' => 'student', 'description' => 'Student']);
        $teacherRole = Role::create(['name' => 'teacher', 'description' => 'Teacher']);

        // Create admin user
        $this->admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ]);
        $this->admin->role()->associate($adminRole);
        $this->admin->save();

        // Create student user
        $studentUser = User::factory()->create([
            'name' => 'Student User',
            'email' => 'student@example.com',
        ]);
        $studentUser->role()->associate($studentRole);
        $studentUser->save();

        // Create a classroom
        $classroom = Classroom::factory()->create();

        // Create student record
        $this->student = Student::factory()->create([
            'user_id' => $studentUser->id,
            'classroom_id' => $classroom->id,
            'admission_number' => 'STU12345',
        ]);

        // Create academic session
        $academicSession = AcademicSession::factory()->current()->create();

        // Create term
        $this->term = Term::factory()->create([
            'name' => 'First Term',
            'is_current' => true,
            'academic_session_id' => $academicSession->id,
        ]);

        // Create teacher
        $teacherUser = User::factory()->create();
        $teacherUser->role()->associate($teacherRole);
        $teacherUser->save();
        $teacher = Teacher::factory()->create(['user_id' => $teacherUser->id]);

        // Create subjects
        $subject1 = Subject::factory()->create(['name' => 'Mathematics']);
        $subject2 = Subject::factory()->create(['name' => 'English']);
        $subject3 = Subject::factory()->create(['name' => 'Science']);

        // Create some results for the student
        $this->results[] = Result::factory()->create([
            'student_id' => $this->student->id,
            'subject_id' => $subject1->id,
            'teacher_id' => $teacher->id,
            'term_id' => $this->term->id,
            'ca_score' => 30,
            'exam_score' => 50,
            'total_score' => 80,
        ]);

        $this->results[] = Result::factory()->create([
            'student_id' => $this->student->id,
            'subject_id' => $subject2->id,
            'teacher_id' => $teacher->id,
            'term_id' => $this->term->id,
            'ca_score' => 30,
            'exam_score' => 50,
            'total_score' => 80,
        ]);

        $this->results[] = Result::factory()->create([
            'student_id' => $this->student->id,
            'subject_id' => $subject3->id,
            'teacher_id' => $teacher->id,
            'term_id' => $this->term->id,
            'ca_score' => 30,
            'exam_score' => 50,
            'total_score' => 80,
        ]);
    }

    /** @test */
    public function admin_can_access_report_card_page()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('report-cards.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('ReportCards/Index'));
    }

    /** @test */
    public function admin_can_generate_report_card()
    {
        $response = $this->actingAs($this->admin)
            ->post(route('report-cards.generate'), [
                'student_id' => $this->student->id,
                'term_id' => $this->term->id,
            ]);

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('ReportCards/Show'));
    }

    /** @test */
    public function admin_can_download_report_card_as_pdf()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('report-cards.generate', [
                'student_id' => $this->student->id,
                'term_id' => $this->term->id,
                'format' => 'pdf',
            ]));

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/pdf');
    }

    /** @test */
    public function student_can_access_their_report_card()
    {
        $response = $this->actingAs($this->student->user)
            ->get(route('student.report-card'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Student/ReportCard'));
    }

    /** @test */
    public function report_card_requires_valid_student_and_term()
    {
        $response = $this->actingAs($this->admin)
            ->post(route('report-cards.generate'), [
                'student_id' => '',
                'term_id' => '',
            ]);

        $response->assertStatus(302); // Redirect due to validation error
        $response->assertSessionHasErrors(['student_id', 'term_id']);
    }

    /** @test */
    public function report_card_calculates_correct_position()
    {
        // Create another student with higher scores
        $anotherStudent = Student::factory()->create();
        
        // Create results for the other student with higher scores
        for ($i = 1; $i <= 3; $i++) {
            Result::factory()->create([
                'student_id' => $anotherStudent->id,
                'term_id' => $this->term->id,
                'ca_score' => 35,
                'exam_score' => 55,
                'total_score' => 90, // Higher score
            ]);
        }

        $response = $this->actingAs($this->admin)
            ->post(route('report-cards.generate'), [
                'student_id' => $this->student->id,
                'term_id' => $this->term->id,
            ]);

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('ReportCards/Show')
                ->has('stats', fn ($stats) => 
                    $stats->where('position', 2) // Should be in position 2 (second place)
                )
        );
    }
}