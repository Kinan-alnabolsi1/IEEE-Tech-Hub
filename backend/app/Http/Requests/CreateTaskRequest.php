<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateTaskRequest extends FormRequest
{
    public function authorize(): bool {
        // Only Project Leaders or Chapter Chairs can create tasks [cite: 58, 62]
        return in_array($this->user()->role, ['Project Leader', 'Chapter Chair']);
    }

    public function rules(): array {
        return [
            'project_id' => 'required|exists:projects,project_id',
            'title' => 'required|string|max:200',
            'description' => 'nullable|string',
            'priority' => 'required|in:Low,Medium,High',
            'status' => 'sometimes|in:To Do,In Progress,Completed',
            'due_date' => 'nullable|date|after_or_equal:today',
            'assigned_users' => 'nullable|array',
            'assigned_users.*' => 'exists:users,user_id'
        ];
    }
}
