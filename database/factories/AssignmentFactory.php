<?php

namespace Database\Factories;

use App\Models\Assignment;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Classroom;
use Illuminate\Database\Eloquent\Factories\Factory;

class AssignmentFactory extends Factory
{
    protected $model = Assignment::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'subject_id' => Subject::factory(),
            'teacher_id' => Teacher::factory(),
            'classroom_id' => Classroom::factory(),
            'due_date' => $this->faker->dateTimeBetween('+1 week', '+4 weeks'),
            'max_score' => $this->faker->numberBetween(50, 100),
        ];
    }
}
