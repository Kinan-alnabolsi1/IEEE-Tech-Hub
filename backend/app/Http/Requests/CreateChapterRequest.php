<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreateChapterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
return in_array($this->user()->role, ['Super Admin', 'Branch Admin']);    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'branch_id' => 'required|exists:branches,branch_id',
            'society_id' => 'nullable|exists:societies,society_id',
            'chair_id' => 'nullable|exists:users,user_id',
            'name' => 'required|string|max:150',
            'description' => 'nullable|string',
        ];
    }
}
