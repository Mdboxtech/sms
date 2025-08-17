<?php

namespace Database\Factories;

use App\Models\AcademicSession;
use Illuminate\Database\Eloquent\Factories\Factory;

class AcademicSessionFactory extends Factory
{
    protected $model = AcademicSession::class;

    public function definition()
    {
        $year = $this->faker->numberBetween(2020, 2023);
        $nextYear = $year + 1;
        
        return [
            'name' => $year . '/' . $nextYear . ' Academic Session',
            'start_date' => $year . '-09-01',
            'end_date' => $nextYear . '-07-31',
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