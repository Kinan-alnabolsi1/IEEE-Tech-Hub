<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Http\Requests\CreateProjectRequest;

class ProjectController extends Controller
{
    /**
     * Display a listing of the projects.
     */
    public function index()
    {
        // جلب المشاريع مع معلومات القائد والأعضاء لتسهيل عرضها بالفرونت إند
        $projects = Project::with(['leader', 'members'])->get();
        return response()->json($projects);
    }

    /**
     * Store a newly created project in storage.
     */
    public function store(CreateProjectRequest $request)
    {
        $project = Project::create($request->validated());
        return response()->json(['message' => 'Project created successfully', 'data' => $project], 201);
    }

    /**
     * Display the specified project with its details.
     */
    public function show($id)
    {
        $project = Project::with(['leader', 'members', 'requiredSkills'])->findOrFail($id);
        return response()->json($project);
    }

    /**
     * Update the specified project in storage.
     */
    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'sometimes|string|max:200',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:Open,Ongoing,Completed,Cancelled'
        ]);
        
        $project->update($validated);
        
        return response()->json(['message' => 'Project updated successfully', 'data' => $project]);
    }

    /**
     * Remove the specified project from storage.
     */
    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        $project->delete();
        
        return response()->json(['message' => 'Project deleted successfully']);
    }

    /**
     * Volunteer applies to join a project.
     */
    public function joinProject(Request $request, $projectId)
    {
        $project = Project::findOrFail($projectId);
        
        // منع المستخدم من التقديم مرتين لنفس المشروع
        if ($project->members()->where('users.user_id', $request->user()->user_id)->exists()) {
            return response()->json(['message' => 'Already applied to this project'], 409);
        }

        $project->members()->attach($request->user()->user_id, [
            'role' => 'Member',
            'status' => 'Pending',
            'applied_at' => now()
        ]);

        return response()->json(['message' => 'Application submitted successfully']);
    }

    /**
     * Approve a volunteer's application.
     */
    public function approveMember(Request $request, $projectId)
    {
        $request->validate([
            'user_id' => 'required|exists:users,user_id'
        ]);

        $project = Project::findOrFail($projectId);

        // تحديث حالة العضو إلى مقبول وتسجيل تاريخ الانضمام الفعلي
        $project->members()->updateExistingPivot($request->user_id, [
            'status' => 'Approved',
            'joined_at' => now()
        ]);

        return response()->json(['message' => 'Member approved successfully']);
    }

    /**
     * Reject a volunteer's application.
     */
    public function rejectMember(Request $request, $projectId)
    {
        $request->validate([
            'user_id' => 'required|exists:users,user_id'
        ]);

        $project = Project::findOrFail($projectId);

        // تحديث حالة العضو إلى مرفوض
        $project->members()->updateExistingPivot($request->user_id, [
            'status' => 'Rejected'
        ]);

        return response()->json(['message' => 'Member rejected successfully']);
    }
}