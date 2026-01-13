<?php

namespace App\Imports;

use App\Models\Student;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class StudentsImport implements ToModel, WithHeadingRow, WithValidation, WithBatchInserts, WithChunkReading
{
    private $rowCount = 0;
    private $importedCount = 0;
    private $errors = [];

    public function model(array $row)
    {
        $this->rowCount++;

        try {
            // Handle empty rows
            if (empty($row['name']) || empty($row['email']) || empty($row['admission_number'])) {
                return null;
            }

            // Get or create student role
            $studentRole = Role::where('name', 'student')->first();
            
            // Create user
            $user = User::create([
                'name' => trim($row['name']),
                'email' => strtolower(trim($row['email'])),
                'password' => Hash::make('password'), // Default password
                'email_verified_at' => now(),
            ]);

            // Assign student role
            if ($studentRole) {
                $user->roles()->attach($studentRole->id);
            }

            // Get classroom ID by name
            $classroom = \App\Models\Classroom::where('name', $row['class'])->first();
            
            if (!$classroom) {
                throw new \Exception("Classroom '{$row['class']}' not found");
            }

            // Handle date of birth
            $dateOfBirth = null;
            if (!empty($row['date_of_birth'])) {
                if (is_numeric($row['date_of_birth'])) {
                    $dateOfBirth = Date::excelToDateTimeObject($row['date_of_birth']);
                } else {
                    $dateOfBirth = \Carbon\Carbon::parse($row['date_of_birth']);
                }
            }

            // Create student
            $student = new Student([
                'user_id' => $user->id,
                'classroom_id' => $classroom->id,
                'admission_number' => trim($row['admission_number']),
                'date_of_birth' => $dateOfBirth,
                'gender' => strtolower(trim($row['gender'])),
                'parent_name' => trim($row['parent_name'] ?? ''),
                'parent_phone' => trim($row['parent_phone'] ?? ''),
                'address' => trim($row['address'] ?? '')
            ]);

            $this->importedCount++;
            return $student;

        } catch (\Exception $e) {
            $this->errors[] = "Row {$this->rowCount}: " . $e->getMessage();
            throw $e;
        }
    }

    public function rules(): array
    {
        return [
            'admission_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('students', 'admission_number')
            ],
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')
            ],
            'class' => 'required|string|exists:classrooms,name',
            'date_of_birth' => 'nullable',
            'gender' => 'required|in:male,female,Male,Female',
            'parent_name' => 'nullable|string|max:255',
            'parent_phone' => 'nullable|string|max:20'
        ];
    }

    public function customValidationMessages()
    {
        return [
            'admission_number.unique' => 'The admission number has already been taken.',
            'email.unique' => 'The email has already been taken.',
            'class.exists' => 'The selected class does not exist in the system.',
        ];
    }

    public function batchSize(): int
    {
        return 50;
    }

    public function chunkSize(): int
    {
        return 100;
    }

    public function getRowCount(): int
    {
        return $this->importedCount;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }

    /**
     * Preview the import data without saving
     */
    public function preview($file, $limit = 10)
    {
        $data = Excel::toArray($this, $file);
        $rows = array_slice($data[0], 1, $limit); // Skip header, take limited rows
        
        $preview = [];
        foreach ($rows as $index => $row) {
            if (count($row) >= 8) { // Ensure minimum columns
                $preview[] = [
                    'row_number' => $index + 2, // +2 because we skip header and arrays are 0-indexed
                    'admission_number' => $row[0] ?? '',
                    'name' => $row[1] ?? '',
                    'email' => $row[2] ?? '',
                    'class' => $row[3] ?? '',
                    'date_of_birth' => $row[4] ?? '',
                    'gender' => $row[5] ?? '',
                    'parent_name' => $row[6] ?? '',
                    'parent_phone' => $row[7] ?? '',
                    'address' => $row[8] ?? '',
                    'is_valid' => $this->validatePreviewRow($row)
                ];
            }
        }
        
        return $preview;
    }

    private function validatePreviewRow($row): bool
    {
        // Basic validation for preview
        $hasRequiredFields = !empty($row[0]) && !empty($row[1]) && !empty($row[2]) && !empty($row[3]);
        $classExists = \App\Models\Classroom::where('name', $row[3] ?? '')->exists();
        $emailFormat = filter_var($row[2] ?? '', FILTER_VALIDATE_EMAIL);
        
        return $hasRequiredFields && $classExists && $emailFormat;
    }
}
