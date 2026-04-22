<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\User; // استبدلنا BranchMembership بـ User
use App\Http\Requests\CreateBranchRequest;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function index() {
        // إذا كنت عامل علاقة admin بالموديل
        return response()->json(Branch::with('admin')->get());
    }

    // 1. السوبر أدمن ينشئ الفرع بدون مدير مبدئياً
    public function store(CreateBranchRequest $request) {
        $validated = $request->validated();
        $validated['status'] = 'Active'; // حالة افتراضية
        $validated['admin_id'] = null;

        $branch = Branch::create($validated);
        
        return response()->json([
            'message' => 'Branch created successfully. Waiting for an admin to register.', 
            'data' => $branch
        ], 201);
    }

    public function show($branchId) {
        // نستخدم Eager Loading لجلب الفرع مع مديره، جمعياته، وفصوله بضربة واحدة
        $branch = Branch::with(['admin', 'societies', 'chapters'])->findOrFail($branchId);
        
        return response()->json([
            'message' => 'Branch retrieved successfully',
            'data' => $branch
        ]);
    }

    // (حذفنا دالة applyToBranch لأن المتطوع يقدم طلبه من خلال الـ AuthController Register)

    // 2. جلب المتطوعين المعلقين في فرع محدد
    public function getPendingMemberships(Request $request, $branchId)
    {
        $branch = Branch::findOrFail($branchId);

        // حماية: السوبر أدمن أو مدير هذا الفرع فقط
        if ($request->user()->role !== 'Super Admin' && $request->user()->branch_id !== $branch->branch_id) {
            return response()->json(['message' => 'Unauthorized. You are not the admin of this branch.'], 403);
        }

        // نجلب المستخدمين (المتطوعين) التابعين لهذا الفرع وحالتهم Pending
        $pendingUsers = User::where('branch_id', $branchId)
                            ->where('role', 'Volunteer')
                            ->where('status', 'Pending')
                            ->get();

        return response()->json([
            'message' => 'Pending volunteers retrieved successfully',
            'data' => $pendingUsers
        ]);
    }

    // 3. مدير الفرع يوافق على المتطوع
    public function approveMembership(Request $request, $userId) {
        $user = User::findOrFail($userId);
        
        // حماية أمنية: تأكد أن المتطوع بنفس فرع المدير
        if ($request->user()->role === 'Branch Admin' && $request->user()->branch_id !== $user->branch_id) {
             return response()->json(['message' => 'You can only approve volunteers in your own branch.'], 403);
        }

        $user->update([
            'status' => 'Active', // تفعيل الحساب
        ]);

        return response()->json(['message' => 'Volunteer approved successfully and can now log in.']);
    }

    // 4. مدير الفرع يرفض المتطوع
    public function rejectMembership(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        
        $user->update([
            'status' => 'Rejected',
        ]);

        return response()->json(['message' => 'Volunteer application rejected.']);
    }

    // 5. فصل متطوع من الفرع
    public function removeMember(Request $request, $branchId, $userId)
    {
        $user = User::where('branch_id', $branchId)
                    ->where('user_id', $userId)
                    ->firstOrFail();

        // تغيير الحالة إلى Suspended للحفاظ على بياناته وعدم حذفها
        $user->update([
            'status' => 'Suspended',
        ]);

        return response()->json(['message' => 'Volunteer has been suspended from the branch successfully.']);
    }

    public function update(Request $request, $id)
    {
        $branch = Branch::findOrFail($id);
        
        $validated = $request->validate([
            // لا نعدل admin_id من هنا لأننا ربطناه بالـ user_id
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
        $branch->delete();

        return response()->json(['message' => 'Branch deleted successfully']);
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

        // السحر هنا: نخزن نتيجة الـ detach (عدد الأسطر المحذوفة)
        $detachedCount = $branch->societies()->detach($societyId);

        // إذا لم يتم حذف أي سطر، يعني الجمعية غير موجودة في هذا الفرع
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
}