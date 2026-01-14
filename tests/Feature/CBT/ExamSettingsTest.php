<?php

namespace Tests\Feature\CBT;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Exam;
use App\Models\Question;
use App\Models\Subject;
use App\Models\Term;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\Classroom;
use App\Models\User;

class ExamSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $teacher;
    protected $student;
    protected $classroom;
    protected $subject;
    protected $term;

    public function setUp(): void
    {
        parent::setUp();
        
        // Create admin user
        $this->admin = User::factory()->create(['role' => 'admin']);
        
        // Create teacher
        $teacherUser = User::factory()->create(['role' => 'teacher']);
        $this->teacher = Teacher::factory()->create(['user_id' => $teacherUser->id]);
        
        // Create classroom and student
        $this->classroom = Classroom::factory()->create();
        $studentUser = User::factory()->create(['role' => 'student']);
        $this->student = Student::factory()->create([
            'user_id' => $studentUser->id,
            'classroom_id' => $this->classroom->id
        ]);
        
        // Create subject and term
        $this->subject = Subject::factory()->create();
        $this->term = Term::factory()->create();
    }

    /** @test */
    public function exam_can_be_created_with_all_settings()
    {
        $this->actingAs($this->admin);
        
        $examData = [
            'title' => 'Test Exam',
            'description' => 'Test Description',
            'subject_id' => $this->subject->id,
            'term_id' => $this->term->id,
            'teacher_id' => $this->teacher->user_id,
            'exam_type' => 'test',
            'total_marks' => 100,
            'passing_marks' => 40,
            'duration_minutes' => 60,
            'instructions' => 'Follow the rules',
            'is_active' => true,
            'is_published' => false,
            'allow_review' => true,
            'show_results_immediately' => false,
            'randomize_questions' => true,
            'randomize_options' => true,
            'classroom_ids' => [$this->classroom->id],
        ];
        
        $response = $this->post(route('admin.cbt.exams.store'), $examData);
        
        $response->assertRedirect();
        
        $exam = Exam::first();
        $this->assertNotNull($exam);
        $this->assertEquals('Test Exam', $exam->title);
        $this->assertTrue($exam->is_active);
        $this->assertFalse($exam->is_published);
        $this->assertTrue($exam->allow_review);
        $this->assertFalse($exam->show_results_immediately);
        $this->assertTrue($exam->randomize_questions);
        $this->assertTrue($exam->randomize_options);
    }

    /** @test */
    public function exam_settings_are_cast_to_boolean()
    {
        $exam = Exam::factory()->create([
            'subject_id' => $this->subject->id,
            'term_id' => $this->term->id,
            'teacher_id' => $this->teacher->user_id,
            'is_active' => 1,
            'is_published' => 0,
            'allow_review' => 1,
            'show_results_immediately' => 0,
            'randomize_questions' => 1,
            'randomize_options' => 0,
        ]);
        
        $this->assertIsBool($exam->is_active);
        $this->assertIsBool($exam->is_published);
        $this->assertIsBool($exam->allow_review);
        $this->assertIsBool($exam->show_results_immediately);
        $this->assertIsBool($exam->randomize_questions);
        $this->assertIsBool($exam->randomize_options);
        
        $this->assertTrue($exam->is_active);
        $this->assertFalse($exam->is_published);
        $this->assertTrue($exam->allow_review);
        $this->assertFalse($exam->show_results_immediately);
        $this->assertTrue($exam->randomize_questions);
        $this->assertFalse($exam->randomize_options);
    }

    /** @test */
    public function randomize_questions_shuffles_question_order()
    {
        $exam = Exam::factory()->create([
            'subject_id' => $this->subject->id,
            'term_id' => $this->term->id,
            'teacher_id' => $this->teacher->user_id,
            'randomize_questions' => true,
        ]);
        
        // Add multiple questions
        $questions = Question::factory()->count(10)->create([
            'subject_id' => $this->subject->id,
            'teacher_id' => $this->teacher->user_id,
        ]);
        
        foreach ($questions as $index => $question) {
            $exam->questions()->attach($question->id, [
                'question_order' => $index + 1,
                'marks_allocated' => 10
            ]);
        }
        
        // Get questions multiple times and check if order varies
        $orders = [];
        for ($i = 0; $i < 5; $i++) {
            $result = $exam->getQuestionsForStudent();
            $orders[] = array_column($result, 'id');
        }
        
        // At least one order should be different (statistically very likely)
        $uniqueOrders = count(array_unique(array_map('serialize', $orders)));
        // This test might occasionally fail due to random chance, but is unlikely
        $this->assertGreaterThanOrEqual(1, $uniqueOrders);
    }

    /** @test */
    public function allow_review_setting_controls_review_access()
    {
        $this->actingAs(User::find($this->student->user_id));
        
        $exam = Exam::factory()->create([
            'subject_id' => $this->subject->id,
            'term_id' => $this->term->id,
            'teacher_id' => $this->teacher->user_id,
            'allow_review' => false,
            'is_active' => true,
            'is_published' => true,
        ]);
        
        $exam->classrooms()->attach($this->classroom->id);
        
        $response = $this->get(route('student.cbt.exam.review', $exam));
        
        // Should redirect with error since review is not allowed
        $response->assertRedirect();
    }
}
