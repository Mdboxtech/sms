<?php

namespace App\Imports;

use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class StudentsImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        // Create user
        $user = User::create([
            'name' => $row['name'],
            'email' => $row['email'],
            'password' => Hash::make('password'), // Default password
            'role' => 'student'
        ]);

        // Get classroom ID by name
        $classroom = \App\Models\Classroom::where('name', $row['class'])->first();

        // Create student
        return new Student([
            'user_id' => $user->id,
            'classroom_id' => $classroom->id,
            'admission_number' => $row['admission_number'],
            'date_of_birth' => \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($row['date_of_birth']),
            'gender' => strtolower($row['gender']),
            'parent_name' => $row['parent_name'],
            'parent_phone' => $row['parent_phone'],
            'address' => $row['address']
        ]);
    }

    public function rules(): array
    {
        return [
            'admission_number' => 'required|unique:students,admission_number',
            'name' => 'required',
            'email' => 'required|email|unique:users,email',
            'class' => 'required|exists:classrooms,name',
            'date_of_birth' => 'required',
            'gender' => 'required|in:male,female,Male,Female',
            'parent_name' => 'required',
            'parent_phone' => 'required'
        ];
    }
}
