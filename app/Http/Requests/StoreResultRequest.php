<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreResultRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check() && (
            Auth::user()->role->name === 'admin' ||
            Auth::user()->role->name === 'teacher'
        );
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'student_id' => 'required|exists:students,id',
            'subject_id' => 'required|exists:subjects,id',
            'term_id' => 'required|exists:terms,id',
            'ca_score' => 'required|numeric|min:0|max:40',
            'exam_score' => 'required|numeric|min:0|max:60',
            'generate_remark' => 'boolean'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'ca_score.max' => 'CA score cannot exceed 40 marks.',
            'exam_score.max' => 'Exam score cannot exceed 60 marks.',
            'student_id.exists' => 'Selected student does not exist.',
            'subject_id.exists' => 'Selected subject does not exist.',
            'term_id.exists' => 'Selected term does not exist.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'generate_remark' => $this->boolean('generate_remark'),
        ]);
    }
}
