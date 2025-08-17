<?php

namespace Database\Factories;

use App\Models\Subject;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubjectFactory extends Factory
{
    protected $model = Subject::class;

    public function definition()
    {
        $subjects = [
            'Mathematics',
            'English Language',
            'Physics',
            'Chemistry',
            'Biology',
            'Geography',
            'History',
            'Economics',
            'Computer Science',
            'Physical Education',
            'Art',
            'Music',
        ];
        
        return [
            'name' => $this->faker->unique()->randomElement($subjects),
            'code' => $this->faker->unique()->regexify('[A-Z]{3}[0-9]{3}'),
            'description' => $this->faker->sentence(),
        ];
    }
}