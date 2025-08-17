<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTermResultRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        $termResult = $this->route('termResult');

        // Admin can always update
        if ($user->isAdmin()) {
            return true;
        }

        // Check if user is the class teacher
        return $user->teacher()
            ->whereHas('classrooms', function ($query) use ($termResult) {
                $query->where('id', $termResult->classroom_id);
            })
            ->exists();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'teacher_comment' => 'nullable|string|max:500',
            'principal_comment' => 'nullable|string|max:500',
        ];
    }
}
