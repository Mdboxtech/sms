<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAttendanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->role === 'admin' || $this->user()->role === 'teacher';
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'date' => 'required|date|before_or_equal:today',
            'classroom_id' => 'required|exists:classrooms,id',
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id' => 'required|exists:terms,id',
            'attendances' => 'required|array|min:1',
            'attendances.*.student_id' => 'required|exists:students,id',
            'attendances.*.status' => ['required', Rule::in(['present', 'absent', 'late', 'excused'])],
            'attendances.*.arrival_time' => 'nullable|date_format:H:i',
            'attendances.*.notes' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'date.before_or_equal' => 'Attendance cannot be marked for future dates.',
            'attendances.*.status.in' => 'Invalid attendance status selected.',
            'attendances.*.arrival_time.date_format' => 'Arrival time must be in HH:MM format.',
            'attendances.required' => 'At least one student attendance must be provided.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'attendances.*.student_id' => 'student',
            'attendances.*.status' => 'attendance status',
            'attendances.*.arrival_time' => 'arrival time',
            'attendances.*.notes' => 'notes',
        ];
    }
}
