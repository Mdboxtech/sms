<?php

namespace Database\Factories;

use App\Models\Classroom;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClassroomFactory extends Factory
{
    protected $model = Classroom::class;

    public function definition()
    {
        $sections = ['A', 'B', 'C'];
        $grades = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
        
        return [
            'name' => $this->faker->randomElement($grades) . ' Grade',
            'section' => $this->faker->randomElement($sections),
            'description' => $this->faker->sentence(),
        ];
    }
}
