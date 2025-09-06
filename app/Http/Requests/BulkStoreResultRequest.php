<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class BulkStoreResultRequest extends FormRequest
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
            'term_id' => 'required|exists:terms,id',
            'results' => 'required|array|min:1',
            'results.*.student_id' => 'required|exists:students,id',
            'results.*.subject_id' => 'required|exists:subjects,id',
            'results.*.ca_score' => 'required|numeric|min:0|max:40',
            'results.*.exam_score' => 'required|numeric|min:0|max:60',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'results.required' => 'At least one result is required.',
            'results.*.ca_score.max' => 'CA score cannot exceed 40 marks.',
            'results.*.exam_score.max' => 'Exam score cannot exceed 60 marks.',
            'results.*.student_id.exists' => 'Selected student does not exist.',
            'results.*.subject_id.exists' => 'Selected subject does not exist.',
        ];
    }
}
