<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\User; // استبدلنا BranchMembership بـ User
use App\Http\Requests\CreateBranchRequest;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function index(Request $request)
{
    $query = Branch::with('admin');

    if ($request->has('has_admin')) {
        if ($request->has_admin === 'true') {
            $query->whereNotNull('admin_id');
        } elseif ($request->has_admin === 'false') {
            $query->whereNull('admin_id');
        }
    }

    return response()->json($query->get());
}

    public function store(CreateBranchRequest $request) {
        $validated = $request->validated();
        $validated['status'] = 'Active';
        $validated['admin_id'] = null;

        $branch = Branch::create($validated);
        
        return response()->json([
            'message' => 'Branch created successfully. Waiting for an admin to register.', 
            'data' => $branch
        ], 201);
    }

    public function show($branchId) {
        $branch = Branch::with(['admin', 'societies', 'chapters'])->findOrFail($branchId);
        
        return response()->json([
            'message' => 'Branch retrieved successfully',
            'data' => $branch
        ]);
    }

    public function getPendingMemberships(Request $request, $branchId)
    {
        $branch = Branch::findOrFail($branchId);

        if ($request->user()->role !== 'Super Admin' && $request->user()->branch_id !== $branch->branch_id) {
            return response()->json(['message' => 'Unauthorized. You are not the admin of this branch.'], 403);
        }

        $pendingUsers = User::where('branch_id', $branchId)
                            ->where('role', 'Volunteer')
                            ->where('status', 'Pending')
                            ->get();

        return response()->json([
            'message' => 'Pending volunteers retrieved successfully',
            'data' => $pendingUsers
        ]);
    }

    public function approveMembership(Request $request, $userId) {
        $user = User::findOrFail($userId);
        
        if ($request->user()->role === 'Branch Admin' && $request->user()->branch_id !== $user->branch_id) {
             return response()->json(['message' => 'You can only approve volunteers in your own branch.'], 403);
        }

        $user->update([
            'status' => 'Active',
        ]);

        return response()->json(['message' => 'Volunteer approved successfully and can now log in.']);
    }

    public function rejectMembership(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        
        $user->update([
            'status' => 'Rejected',
        ]);

        return response()->json(['message' => 'Volunteer application rejected.']);
    }

    public function removeMember(Request $request, $branchId, $userId)
    {
        $user = User::where('branch_id', $branchId)
                    ->where('user_id', $userId)
                    ->firstOrFail();

        $user->update([
            'status' => 'Suspended',
        ]);

        return response()->json(['message' => 'Volunteer has been suspended from the branch successfully.']);
    }

    public function update(Request $request, $id)
    {
        $branch = Branch::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:150',
            'region' => 'sometimes|string|max:100',
            'description' => 'nullable|string',
            'contact_email' => 'nullable|email|max:150',
            'contact_phone' => 'nullable|string|max:30',
            'founded_date' => 'nullable|date',
        ]);

        $branch->update($validated);

        return response()->json(['message' => 'Branch updated successfully', 'data' => $branch]);
    }

    public function destroy($id)
{
    $branch = Branch::findOrFail($id);

    \App\Models\User::where('branch_id', $id)->update([
        'branch_id' => null,
        'status' => 'Suspended'
    ]);

    $branch->delete();

    return response()->json([
        'message' => 'Branch deleted successfully. Associated users have been suspended and unlinked.'
    ]);
}

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Active,Suspended'
        ]);

        $branch = Branch::findOrFail($id);
        $branch->update(['status' => $request->status]);

        return response()->json(['message' => "Branch status updated to {$request->status}", 'data' => $branch]);
    }

    public function attachSocieties(Request $request, $branchId)
    {
        $request->validate([
            'society_ids' => 'required|array',
            'society_ids.*' => 'exists:societies,society_id'
        ]);

        $branch = Branch::findOrFail($branchId);
        $branch->societies()->syncWithoutDetaching($request->society_ids);

        return response()->json([
            'message' => 'Societies linked to branch successfully',
            'data' => $branch->load('societies')
        ]);
    }

    /**
     * Remove (detach) a specific society from a branch.
     * DELETE /api/branches/{branch_id}/societies/{society_id}
     */
    public function detachSociety($branchId, $societyId)
    {
        $branch = Branch::findOrFail($branchId);

        $detachedCount = $branch->societies()->detach($societyId);

        if ($detachedCount === 0) {
            return response()->json([
                'message' => 'Society is not attached to this branch or does not exist.'
            ], 404);
        }

        return response()->json([
            'message' => 'Society removed from branch successfully.',
            'data' => $branch->load('societies') 
        ]);
    }

    /**
     * GET /api/branches/{branch_id}/stats
     */
    public function getStats(Request $request, $branchId)
    {
        $branch = Branch::findOrFail($branchId);

        if ($request->user()->role !== 'Super Admin' && $request->user()->branch_id !== $branch->branch_id) {
            return response()->json(['message' => 'Unauthorized to view these statistics.'], 403);
        }

        $totalVolunteers = \App\Models\User::where('branch_id', $branchId)
            ->where('role', 'Volunteer')
            ->where('status', 'Active')
            ->count();

        $pendingRequests = \App\Models\User::where('branch_id', $branchId)
            ->where('role', 'Volunteer')
            ->where('status', 'Pending')
            ->count();

        $activeChapters = \App\Models\Chapter::where('branch_id', $branchId)
            ->where('status', 'Active')
            ->count();

        
        $chapterIds = \App\Models\Chapter::where('branch_id', $branchId)->pluck('chapter_id');

        $ongoingProjects = \App\Models\Project::whereIn('chapter_id', $chapterIds)
            ->where('status', 'Ongoing') 
            ->count();
            

        $volunteersPerChapter = \App\Models\Chapter::where('branch_id', $branchId)
            ->withCount('members') 
            ->get(['chapter_id', 'name']); 

        return response()->json([
            'message' => 'Branch statistics retrieved successfully',
            'data' => [
                'cards' => [
                    'total_volunteers' => $totalVolunteers,
                    'pending_requests' => $pendingRequests,
                    'active_chapters' => $activeChapters,
                    'ongoing_projects' => $ongoingProjects,
                ],
                'charts' => [
                    'volunteers_per_chapter' => $volunteersPerChapter,
                ]
            ]
        ]);
    }

    /**
     * GET /api/branches/{branch_id}/volunteers?status=Active
     */
    public function getVolunteers(Request $request, $branchId)
    {
        $branch = Branch::findOrFail($branchId);

        if ($request->user()->role !== 'Super Admin' && $request->user()->branch_id !== $branch->branch_id) {
            return response()->json(['message' => 'Unauthorized to view these volunteers.'], 403);
        }

        $query = \App\Models\User::where('branch_id', $branchId)
                                    ->where('role', 'Volunteer')
                                    ->whereNotNull('email_verified_at');

        if ($request->has('status')) {
            $validStatuses = ['Pending', 'Active', 'Suspended', 'Rejected'];
            if (in_array($request->status, $validStatuses)) {
                $query->where('status', $request->status);
            }
        }

        $volunteers = $query->latest()->get();

        return response()->json([
            'message' => 'Volunteers retrieved successfully',
            'data' => $volunteers
        ]);
    }
}