<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Http\Requests\CreateProjectRequest;

class ProjectController extends Controller
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
    public function store(CreateProjectRequest $request)
    {
        $project = Project::create($request->validated());
        return response()->json(['message' => 'Project created', 'data' => $project], 201);
    }

    public function joinProject(Request $request, $projectId)
    {
        $project = Project::findOrFail($projectId);
        
        // Ensure user is not already applied
        if ($project->members()->where('users.user_id', $request->user()->user_id)->exists()) {
            return response()->json(['message' => 'Already applied to this project'], 409);
        }

        $project->members()->attach($request->user()->user_id, [
            'role' => 'Member',
            'status' => 'Pending'
        ]);

        return response()->json(['message' => 'Application submitted successfully']);
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
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
