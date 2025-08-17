<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Term;
use App\Models\Role;
use App\Models\Result;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\TermResult;
use App\Models\Classroom;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TermResultTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $teacher;
    protected $otherTeacher;
    protected $student;
    protected $term;
    protected $classroom;
    protected $termResult;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RoleSeeder::class);

        // Create test data
        $adminRole = Role::where('name', 'admin')->first();
        $teacherRole = Role::where('name', 'teacher')->first();

        $this->admin = User::factory()->create(['role_id' => $adminRole->id]);
        
        $teacher = User::factory()->create(['role_id' => $teacherRole->id]);
        $this->teacher = Teacher::factory()->create(['user_id' => $teacher->id]);
        
        $otherTeacher = User::factory()->create(['role_id' => $teacherRole->id]);
        $this->otherTeacher = Teacher::factory()->create(['user_id' => $otherTeacher->id]);
        
        $this->classroom = Classroom::factory()->create();
        $this->classroom->teachers()->attach($this->teacher->id);

        $student = User::factory()->create();
        $this->student = Student::factory()->create([
            'user_id' => $student->id,
            'classroom_id' => $this->classroom->id
        ]);

        $this->term = Term::factory()->create();

        // Create a term result
        $this->termResult = TermResult::create([
            'student_id' => $this->student->id,
            'term_id' => $this->term->id,
            'classroom_id' => $this->classroom->id,
            'average_score' => 75.5,
            'position' => 1,
            'teacher_comment' => 'Initial teacher comment',
            'principal_comment' => 'Initial principal comment',
        ]);
    }

    /** @test */
    public function class_teacher_can_update_teacher_comment()
    {
        $response = $this->actingAs($this->teacher->user)
            ->patch(route('admin.term-results.comments', $this->termResult), [
                'teacher_comment' => 'New teacher comment'
            ]);

        $response->assertRedirect();
        $this->termResult->refresh();
        $this->assertEquals('New teacher comment', $this->termResult->teacher_comment);
        $this->assertEquals($this->teacher->user->id, $this->termResult->teacher_id);
    }

    /** @test */
    public function non_class_teacher_cannot_update_teacher_comment()
    {
        $response = $this->actingAs($this->otherTeacher->user)
            ->patch(route('admin.term-results.comments', $this->termResult), [
                'teacher_comment' => 'Unauthorized comment'
            ]);

        $response->assertForbidden();
        $this->termResult->refresh();
        $this->assertEquals('Initial teacher comment', $this->termResult->teacher_comment);
    }

    /** @test */
    public function admin_can_update_all_comments()
    {
        $response = $this->actingAs($this->admin)
            ->patch(route('admin.term-results.comments', $this->termResult), [
                'teacher_comment' => 'Admin teacher comment',
                'principal_comment' => 'Admin principal comment'
            ]);

        $response->assertRedirect();
        $this->termResult->refresh();
        $this->assertEquals('Admin teacher comment', $this->termResult->teacher_comment);
        $this->assertEquals('Admin principal comment', $this->termResult->principal_comment);
        $this->assertEquals($this->admin->id, $this->termResult->principal_id);
    }

    /** @test */
    public function class_teacher_cannot_update_principal_comment()
    {
        $response = $this->actingAs($this->teacher->user)
            ->patch(route('admin.term-results.comments', $this->termResult), [
                'teacher_comment' => 'Valid teacher comment',
                'principal_comment' => 'Unauthorized principal comment'
            ]);

        $response->assertSuccessful();
        $this->termResult->refresh();
        $this->assertEquals('Valid teacher comment', $this->termResult->teacher_comment);
        $this->assertEquals('Initial principal comment', $this->termResult->principal_comment);
    }

    /** @test */
    public function can_view_term_result_details()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.term-results.show', $this->termResult));

        $response->assertSuccessful()
            ->assertInertia(fn ($assert) => $assert
                ->component('TermResults/Show')
                ->has('termResult', fn ($assert) => $assert
                    ->where('id', $this->termResult->id)
                    ->where('average_score', 75.5)
                    ->where('position', 1)
                    ->where('teacher_comment', 'Initial teacher comment')
                    ->where('principal_comment', 'Initial principal comment')
                )
            );
    }

    /** @test */
    public function comments_are_validated()
    {
        $response = $this->actingAs($this->admin)
            ->patch(route('admin.term-results.comments', $this->termResult), [
                'teacher_comment' => str_repeat('x', 501), // Exceeds max length
                'principal_comment' => str_repeat('x', 501)
            ]);

        $response->assertSessionHasErrors(['teacher_comment', 'principal_comment']);
    }
}
