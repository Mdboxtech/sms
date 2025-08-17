<?php

namespace Database\Factories;

use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;

class RoleFactory extends Factory
{
    protected $model = Role::class;

    public function definition()
    {
        return [
            'name' => fake()->randomElement(['admin', 'teacher', 'student']),
        ];
    }

    public function admin()
    {
        return $this->state(function () {
            return ['name' => 'admin'];
        });
    }

    public function teacher()
    {
        return $this->state(function () {
            return ['name' => 'teacher'];
        });
    }

    public function student()
    {
        return $this->state(function () {
            return ['name' => 'student'];
        });
    }
}
