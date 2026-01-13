<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Student;
use App\Models\Fee;
use App\Models\Classroom;
use App\Models\AcademicSession;
use App\Models\Term;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PaymentSystemTest extends TestCase
{
    use RefreshDatabase;

    private $admin;
    private $student;
    private $studentUser;
    private $classroom;
    private $academicSession;
    private $term;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create admin user
        $this->admin = User::factory()->create([
            'email' => 'admin@test.com',
            'role' => 'admin'
        ]);

        // Create academic session and term
        $this->academicSession = AcademicSession::create([
            'name' => '2023/2024',
            'start_date' => '2023-09-01',
            'end_date' => '2024-07-31',
            'is_current' => true
        ]);

        $this->term = Term::create([
            'name' => 'First Term',
            'academic_session_id' => $this->academicSession->id,
            'start_date' => '2023-09-01',
            'end_date' => '2023-12-15',
            'is_current' => true
        ]);

        // Create classroom
        $this->classroom = Classroom::create([
            'name' => 'JSS 1A',
            'capacity' => 30
        ]);

        // Create student user and student
        $this->studentUser = User::factory()->create([
            'email' => 'student@test.com',
            'role' => 'student'
        ]);

        $this->student = Student::create([
            'user_id' => $this->studentUser->id,
            'admission_number' => 'STD001',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'classroom_id' => $this->classroom->id,
            'date_of_birth' => '2010-01-01',
            'gender' => 'male',
            'address' => '123 Test Street',
            'phone' => '1234567890',
            'guardian_name' => 'Jane Doe',
            'guardian_phone' => '0987654321'
        ]);
    }

    /** @test */
    public function admin_can_access_fee_management_page()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.fees.index'));

        $response->assertStatus(200);
    }

    /** @test */
    public function admin_can_create_fee()
    {
        $feeData = [
            'name' => 'Tuition Fee',
            'amount' => 50000,
            'type' => 'tuition',
            'description' => 'School tuition fee',
            'due_date' => '2024-01-31',
            'academic_session_id' => $this->academicSession->id,
            'term_id' => $this->term->id,
            'classroom_ids' => [$this->classroom->id],
            'allow_partial_payment' => true,
            'minimum_amount' => 25000
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('admin.fees.store'), $feeData);

        $response->assertRedirect();
        $this->assertDatabaseHas('fees', [
            'name' => 'Tuition Fee',
            'amount' => 50000
        ]);
    }

    /** @test */
    public function student_can_access_payment_dashboard()
    {
        $response = $this->actingAs($this->studentUser)
            ->get(route('student.payments.dashboard'));

        $response->assertStatus(200);
    }

    /** @test */
    public function student_can_view_payment_history()
    {
        $response = $this->actingAs($this->studentUser)
            ->get(route('student.payments.history'));

        $response->assertStatus(200);
    }

    /** @test */
    public function student_can_view_fee_details()
    {
        // Create a fee for the student's classroom
        $fee = Fee::create([
            'name' => 'Test Fee',
            'amount' => 10000,
            'type' => 'tuition',
            'due_date' => '2024-01-31',
            'academic_session_id' => $this->academicSession->id,
            'term_id' => $this->term->id,
            'allow_partial_payment' => true
        ]);

        $fee->classrooms()->attach($this->classroom->id);

        $response = $this->actingAs($this->studentUser)
            ->get(route('student.payments.fee.details', $fee->id));

        $response->assertStatus(200);
    }

    /** @test */
    public function admin_can_access_payment_settings()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.settings.payments'));

        $response->assertStatus(200);
    }

    /** @test */
    public function admin_can_update_paystack_settings()
    {
        $settingsData = [
            'paystack_public_key' => 'pk_test_example',
            'paystack_secret_key' => 'sk_test_example',
            'paystack_webhook_secret' => 'whsec_example'
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('admin.settings.payments.update'), $settingsData);

        $response->assertRedirect();
    }

    /** @test */
    public function student_cannot_access_admin_routes()
    {
        $response = $this->actingAs($this->studentUser)
            ->get(route('admin.fees.index'));

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_cannot_access_student_payment_routes()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('student.payments.dashboard'));

        $response->assertStatus(403);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_payment_routes()
    {
        $routes = [
            'admin.fees.index',
            'student.payments.dashboard',
            'admin.settings.payments'
        ];

        foreach ($routes as $route) {
            $response = $this->get(route($route));
            $response->assertRedirect(route('login'));
        }
    }
}
