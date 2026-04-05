<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\BranchMembership;
use App\Http\Requests\CreateBranchRequest;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function index() {
        return response()->json(Branch::with('admin')->get());
    }

    public function store(CreateBranchRequest $request) {
        $branch = Branch::create($request->validated());
        return response()->json(['message' => 'Branch created', 'data' => $branch], 201);
    }

    public function show($id) {
        return response()->json(Branch::with(['admin', 'societies', 'chapters'])->findOrFail($id));
    }

    // المتطوع يرسل طلب انضمام للفرع
    public function applyToBranch(Request $request, $branchId) {
        $branch = Branch::findOrFail($branchId);
        
        // التحقق مما إذا كان قد قدم مسبقاً
        if (BranchMembership::where('user_id', $request->user()->user_id)->where('branch_id', $branchId)->exists()) {
            return response()->json(['message' => 'You have already applied to this branch'], 409);
        }

        $membership = BranchMembership::create([
            'user_id' => $request->user()->user_id,
            'branch_id' => $branchId,
            'status' => 'Pending',
            'applied_at' => now(),
            'notes' => $request->notes ?? null
        ]);

        return response()->json(['message' => 'Application submitted successfully', 'data' => $membership]);
    }

    // مدير الفرع يوافق على المتطوع
    public function approveMembership(Request $request, $membershipId) {
        $membership = BranchMembership::findOrFail($membershipId);
        
        $membership->update([
            'status' => 'Approved',
            'reviewed_at' => now(),
            'reviewed_by' => $request->user()->user_id
        ]);

        return response()->json(['message' => 'Membership approved']);
    }

    /**
     * Update the specified branch. (PUT /api/branches/{branch_id})
     */
    public function update(Request $request, $id)
    {
        $branch = Branch::findOrFail($id);
        
        $validated = $request->validate([
            'admin_id' => 'sometimes|exists:users,user_id',
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

    /**
     * Remove the specified branch. (DELETE /api/branches/{branch_id})
     */
    public function destroy($id)
    {
        $branch = Branch::findOrFail($id);
        $branch->delete();

        return response()->json(['message' => 'Branch deleted successfully']);
    }

    /**
     * Update branch status (Active/Suspended). (PATCH /api/branches/{branch_id}/status)
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Active,Suspended'
        ]);

        $branch = Branch::findOrFail($id);
        $branch->update(['status' => $request->status]);

        return response()->json(['message' => "Branch status updated to {$request->status}", 'data' => $branch]);
    }

    /**
     * Get pending membership requests for a specific branch.
     * GET /api/branches/{branch}/memberships/pending
     */
    public function getPendingMemberships(Request $request, $branchId)
    {
        $branch = Branch::findOrFail($branchId);

        // حماية (Authorization): تأكد أن الشخص الذي يطلب القائمة هو إما Super Admin أو مدير هذا الفرع تحديداً
        if ($request->user()->role !== 'Super Admin' && $branch->admin_id !== $request->user()->user_id) {
            return response()->json(['message' => 'Unauthorized. You are not the admin of this branch.'], 403);
        }

        // جلب الطلبات المعلقة مع بيانات المستخدمين (المتطوعين) الذين قدموها
        $pendingRequests = BranchMembership::with('user')
            ->where('branch_id', $branchId)
            ->where('status', 'Pending')
            ->get();

        return response()->json([
            'message' => 'Pending memberships retrieved successfully',
            'data' => $pendingRequests
        ]);
    }

    /**
     * Reject a membership request.
     * PATCH /api/memberships/{membership}/reject
     */
    public function rejectMembership(Request $request, $membershipId)
    {
        $membership = BranchMembership::findOrFail($membershipId);
        
        $membership->update([
            'status' => 'Rejected',
            'reviewed_at' => now(),
            'reviewed_by' => $request->user()->user_id,
            'notes' => $request->notes ?? $membership->notes // إمكانية إضافة سبب الرفض
        ]);

        return response()->json(['message' => 'Membership application rejected.']);
    }

    /**
     * Remove (Terminate) an existing member from the branch.
     * PATCH /api/branches/{branch}/remove-member/{user_id}
     */
    public function removeMember(Request $request, $branchId, $userId)
    {
        $membership = BranchMembership::where('branch_id', $branchId)
            ->where('user_id', $userId)
            ->firstOrFail();

        // تغيير الحالة إلى Suspended (فصل) بدلاً من الحذف للحفاظ على الأرشفة
        $membership->update([
            'status' => 'Suspended',
            'reviewed_at' => now(),
            'reviewed_by' => $request->user()->user_id,
            'notes' => 'Member was terminated from the branch.'
        ]);

        return response()->json(['message' => 'Member has been terminated from the branch successfully.']);
    }

    /**
     * Link societies to a specific branch.
     * POST /api/branches/{branch}/societies
     */
    public function attachSocieties(Request $request, $branchId)
    {
        $request->validate([
            'society_ids' => 'required|array',
            'society_ids.*' => 'exists:societies,society_id' // التأكد أن الأرقام موجودة بجدول الجمعيات
        ]);

        $branch = Branch::findOrFail($branchId);

        // استخدمنا syncWithoutDetaching حتى لا يحذف الجمعيات المربوطة سابقاً
        $branch->societies()->syncWithoutDetaching($request->society_ids);

        return response()->json([
            'message' => 'Societies linked to branch successfully',
            'data' => $branch->load('societies') // إرجاع الفرع مع جمعياته بعد التحديث
        ]);
    }
}