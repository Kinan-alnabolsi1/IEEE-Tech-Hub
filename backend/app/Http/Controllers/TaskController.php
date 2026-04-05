<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskAssignment;
use App\Http\Requests\CreateTaskRequest;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateTaskRequest $request)
    {
        $validated = $request->validated();
        
        $task = Task::create([
            'project_id' => $validated['project_id'],
            'created_by' => $request->user()->user_id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'priority' => $validated['priority'],
            'due_date' => $validated['due_date'] ?? null,
            'status' => 'To Do'
        ]);

        // If users were provided, assign them
        if (!empty($validated['assigned_users'])) {
            foreach ($validated['assigned_users'] as $userId) {
                TaskAssignment::create([
                    'task_id' => $task->task_id,
                    'user_id' => $userId,
                    'assigned_by' => $request->user()->user_id,
                    'assigned_at' => now(),
                ]);
            }
        }

        return response()->json([
            'message' => 'Task created successfully', 
            'task' => $task->load('assignedUsers')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function updateProgress(Request $request, $assignmentId)
    {
        $request->validate([
            'completion_pct' => 'required|integer|min:0|max:100',
            'progress_note' => 'nullable|string'
        ]);

        $assignment = TaskAssignment::findOrFail($assignmentId);

        // Ensure only the assigned user can update their progress
        if ($assignment->user_id !== $request->user()->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $assignment->update([
            'completion_pct' => $request->completion_pct,
            'progress_note' => $request->progress_note,
            'completed_at' => $request->completion_pct == 100 ? now() : null
        ]);

        return response()->json(['message' => 'Progress updated', 'data' => $assignment]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
