<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateResultRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check() && (
            Auth::user()->role->name === 'admin' ||
            (Auth::user()->role->name === 'teacher' && $this->result->teacher_id === Auth::id())
        );
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
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
