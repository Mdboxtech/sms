<?php

namespace Database\Factories;

use App\Models\Attendance;
use App\Models\Student;
use App\Models\Classroom;
use App\Models\AcademicSession;
use App\Models\Term;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Attendance>
 */
class AttendanceFactory extends Factory
{
    protected $model = Attendance::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'classroom_id' => Classroom::factory(),
            'academic_session_id' => AcademicSession::factory(),
            'term_id' => Term::factory(),
            'date' => $this->faker->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
            'status' => $this->faker->randomElement(['present', 'absent', 'late', 'excused']),
            'arrival_time' => $this->faker->optional(0.7)->time('H:i'),
            'notes' => $this->faker->optional(0.3)->sentence(),
            'marked_by' => User::factory(),
            'marked_at' => now(),
            'updated_by' => null,
        ];
    }

    /**
     * Indicate that the attendance is present.
     */
    public function present(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'present',
            'arrival_time' => $this->faker->time('H:i', '09:00:00'),
        ]);
    }

    /**
     * Indicate that the attendance is absent.
     */
    public function absent(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'absent',
            'arrival_time' => null,
            'notes' => $this->faker->sentence(),
        ]);
    }

    /**
     * Indicate that the attendance is late.
     */
    public function late(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'late',
            'arrival_time' => $this->faker->time('H:i', '09:30:00'),
            'notes' => 'Arrived late',
        ]);
    }

    /**
     * Indicate that the attendance is excused.
     */
    public function excused(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'excused',
            'arrival_time' => null,
            'notes' => $this->faker->randomElement([
                'Medical appointment',
                'Family emergency',
                'School activity',
                'Sick leave'
            ]),
        ]);
    }

    /**
     * Create attendance for a specific date range.
     */
    public function forDateRange(Carbon $startDate, Carbon $endDate): static
    {
        return $this->state(fn (array $attributes) => [
            'date' => $this->faker->dateTimeBetween($startDate, $endDate)->format('Y-m-d'),
        ]);
    }

    /**
     * Create attendance for a specific student.
     */
    public function forStudent(Student $student): static
    {
        return $this->state(fn (array $attributes) => [
            'student_id' => $student->id,
            'classroom_id' => $student->classroom_id,
        ]);
    }

    /**
     * Create attendance for a specific classroom.
     */
    public function forClassroom(Classroom $classroom): static
    {
        return $this->state(fn (array $attributes) => [
            'classroom_id' => $classroom->id,
        ]);
    }
}
