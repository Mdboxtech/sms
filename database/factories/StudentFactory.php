<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Student;
use App\Models\Classroom;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition()
    {
        return [
            'user_id' => User::factory()->create(['role_id' => \App\Models\Role::where('name', 'student')->first()->id])->id,
            'classroom_id' => Classroom::factory(),
            'admission_number' => $this->faker->unique()->regexify('[A-Z]{2}[0-9]{4}'),
            'date_of_birth' => $this->faker->date('Y-m-d', '-15 years'),
            'gender' => $this->faker->randomElement(['male', 'female']),
            'parent_name' => $this->faker->name,
            'parent_phone' => $this->faker->phoneNumber,
            'address' => $this->faker->address,
        ];
    }
}
