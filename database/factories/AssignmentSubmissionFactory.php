<?php

namespace Database\Factories;

use App\Models\AssignmentSubmission;
use App\Models\Assignment;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

class AssignmentSubmissionFactory extends Factory
{
    protected $model = AssignmentSubmission::class;

    public function definition(): array
    {
        return [
            'assignment_id' => Assignment::factory(),
            'student_id' => Student::factory(),
            'submission_text' => $this->faker->paragraph(),
            'file_path' => $this->faker->optional()->filePath(),
            'score' => $this->faker->optional()->randomFloat(2, 0, 100),
            'feedback' => $this->faker->optional()->sentence(),
            'submitted_at' => $this->faker->dateTimeThisMonth(),
        ];
    }
}
