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
        $totalBranches = Branch::count();
        $totalVolunteers = User::where('role', 'Volunteer')->count();
        $activeProjects = Project::whereIn('status', ['Open', 'Ongoing'])->count();
        $branchAdminsCount = User::where('role', 'Branch Admin')->count();

        
        $volunteersGrowth = User::where('role', 'Volunteer')
            ->select(
                DB::raw("COUNT(user_id) as count"), 
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month")
            )
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->take(6)
            ->get();

        $branchesByRegion = Branch::select(
                DB::raw("COUNT(branch_id) as count"), 
                'region'
            )
            ->groupBy('region')
            ->get();

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