<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\User;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /**
     * Get aggregated stats for the Super Admin Dashboard.
     */
    public function getStats(Request $request)
    {
        // 1. حساب بيانات البطاقات الإحصائية (Cards)
        $totalBranches = Branch::count();
        $totalVolunteers = User::where('role', 'Volunteer')->count();
        $activeProjects = Project::whereIn('status', ['Open', 'Ongoing'])->count();
        
        // جلب عدد مدراء الفروع (يمكنك لاحقاً تخصيصها للموقوفين Suspended كمثال)
        $branchAdminsCount = User::where('role', 'Branch Admin')->count();

        // 2. بيانات الرسوم البيانية (Charts)
        
        // أ. نمو المتطوعين خلال الأشهر (Volunteers Growth)
        $volunteersGrowth = User::where('role', 'Volunteer')
            ->select(
                DB::raw("COUNT(user_id) as count"), 
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month") // استخراج السنة والشهر
            )
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->take(6) // آخر 6 أشهر
            ->get();

        // ب. توزع الفروع حسب المنطقة (Branches by Region)
        $branchesByRegion = Branch::select(
                DB::raw("COUNT(branch_id) as count"), 
                'region'
            )
            ->groupBy('region')
            ->get();

        // 3. إرجاع النتيجة كـ JSON مهيأ للفرونت إند
        return response()->json([
            'cards' => [
                'total_branches' => $totalBranches,
                'total_volunteers' => $totalVolunteers,
                'active_projects' => $activeProjects,
                'total_branch_admins' => $branchAdminsCount,
            ],
            'charts' => [
                'volunteers_growth' => $volunteersGrowth,
                'branches_by_region' => $branchesByRegion,
            ]
        ]);
    }
}