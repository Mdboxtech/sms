<?php

namespace Database\Factories;

use App\Models\Term;
use App\Models\AcademicSession;
use Illuminate\Database\Eloquent\Factories\Factory;

class TermFactory extends Factory
{
    protected $model = Term::class;

    public function definition()
    {
        return [
            'name' => $this->faker->randomElement(['First Term', 'Second Term', 'Third Term']),
            'academic_session_id' => AcademicSession::factory(),
            'start_date' => $this->faker->date(),
            'end_date' => $this->faker->date(),
            'is_current' => false,
        ];
    }

    public function current()
    {
        return $this->state(function (array $attributes) {
            return [
                'is_current' => true,
            ];
        });
    }
}