<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreateBranchRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->role === 'Super Admin';    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // 'admin_id' => 'required|exists:users,user_id',
            'name' => 'required|string|max:150',
            'region' => 'required|string|max:100',
            'description' => 'nullable|string',
            'contact_email' => 'nullable|email|max:150',
            'contact_phone' => 'nullable|string|max:30',
            'founded_date' => 'nullable|date',
        ];
    }
}
