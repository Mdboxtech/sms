<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use App\Models\Result;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Term;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ResultTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    protected $teacher;
    protected $student;
    protected $subject;
    protected $term;

    protected function setUp(): void
    {
        parent::setUp();

        // Create teacher role
        $teacherRole = Role::firstOrCreate(['name' => 'teacher', 'description' => 'Teacher']);
        
        // Create a teacher user with the role
        $this->teacher = User::factory()->create([
            'role_id' => $teacherRole->id
        ]);

        // Create teacher record
        Teacher::factory()->create([
            'user_id' => $this->teacher->id
        ]);

        // Verify teacher role
        $this->assertTrue($this->teacher->isTeacher());

        // Create test data
        $this->student = Student::factory()->create();
        $this->subject = Subject::factory()->create();
        $this->term = Term::factory()->create();
    }

    public function test_teacher_can_create_result()
    {
        $response = $this->actingAs($this->teacher)
            ->withSession(['_token' => 'test-token'])
            ->post(route('teacher.results.store'), [
                'student_id' => $this->student->id,
                'subject_id' => $this->subject->id,
                'term_id' => $this->term->id,
                'ca_score' => 35,
                'exam_score' => 55,
                '_token' => 'test-token'
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('results', [
            'student_id' => $this->student->id,
            'subject_id' => $this->subject->id,
            'term_id' => $this->term->id,
            'ca_score' => 35,
            'exam_score' => 55,
            'total_score' => 90,
        ]);
    }

    public function test_total_score_is_calculated_automatically()
    {
        $result = Result::create([
            'student_id' => $this->student->id,
            'subject_id' => $this->subject->id,
            'term_id' => $this->term->id,
            'teacher_id' => $this->teacher->id,
            'ca_score' => 30,
            'exam_score' => 50,
        ]);

        $this->assertEquals(80, $result->total_score);
    }

    public function test_can_export_results()
    {
        Result::create([
            'student_id' => $this->student->id,
            'subject_id' => $this->subject->id,
            'term_id' => $this->term->id,
            'teacher_id' => $this->teacher->id,
            'ca_score' => 35,
            'exam_score' => 55,
        ]);

        $response = $this->actingAs($this->teacher)
            ->get(route('teacher.results.export', [
                'term_id' => $this->term->id
            ]));

        $response->assertOk();
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    public function test_can_generate_ai_remarks()
    {
        $result = Result::create([
            'student_id' => $this->student->id,
            'subject_id' => $this->subject->id,
            'term_id' => $this->term->id,
            'teacher_id' => $this->teacher->id,
            'ca_score' => 35,
            'exam_score' => 55,
        ]);

        $response = $this->actingAs($this->teacher)
            ->post(route('teacher.results.generate-remarks'), [
                'result_ids' => [$result->id]
            ]);

        $response->assertRedirect();
        $this->assertNotNull(Result::find($result->id)->remark);
    }
}
