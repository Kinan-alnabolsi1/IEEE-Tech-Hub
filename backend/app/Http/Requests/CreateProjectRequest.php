<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreateProjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return in_array($this->user()->role, ['Super Admin', 'Branch Admin', 'Chapter Chair']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'chapter_id' => 'required|exists:chapters,chapter_id',
            'title' => 'required|string|max:200',
            'description' => 'nullable|string',
            'max_members' => 'nullable|integer|min:1',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            // 🛑 القواعد الخاصة بمصفوفة الأدوار (لتمريرها بأمان)
            'required_roles' => 'nullable|array',
            'required_roles.*.role_name' => 'required_with:required_roles|string|max:100',
            'required_roles.*.required_count' => 'required_with:required_roles|integer|min:1',
            
            // 🛑 القواعد الخاصة بمصفوفة المهارات (لتمريرها بأمان)
            'required_skills' => 'nullable|array',
            'required_skills.*.skill_id' => 'required_with:required_skills|exists:skills,skill_id',
            'required_skills.*.min_level' => 'required_with:required_skills|integer|min:1|max:5',
            'required_skills.*.weight' => 'required_with:required_skills|numeric|min:0',
        ];
    }
}