<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Role;
use App\Models\Teacher;
use Illuminate\Database\Eloquent\Factories\Factory;

class TeacherFactory extends Factory
{
    protected $model = Teacher::class;

    public function definition()
    {
        return [
            'user_id' => null,
            'employee_id' => $this->faker->unique()->regexify('TCH[0-9]{4}'),
            'qualification' => $this->faker->randomElement(['B.Ed', 'M.Ed', 'PhD', 'B.Sc', 'M.Sc']),
            'specialization' => $this->faker->randomElement(['Mathematics', 'English', 'Science']),
            'phone' => $this->faker->phoneNumber,
            'address' => $this->faker->address,
            'date_joined' => $this->faker->date('Y-m-d', '-5 years'),
            'status' => 'active',
        ];
    }
}