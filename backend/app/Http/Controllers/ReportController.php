<?php

namespace App\Http\Controllers;

use App\Models\ProjectReport;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * جلب جميع التقارير المصعدة للنظام مع نظام الفلترة
     * GET /api/reports/system
     */
    public function getSystemReports(Request $request)
    {
        // حماية: فقط السوبر أدمن يمكنه رؤية جميع تقارير النظام
        if ($request->user()->role !== 'Super Admin') {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        // جلب التقارير مع بيانات المشروع، الفصل، الفرع، وصاحب التقرير
        $query = ProjectReport::with(['project.chapter.branch', 'submitter']);

        // فلترة 1: حسب فرع معين (إذا تم إرسال branch_id من الفرونت إند)
        if ($request->has('branch_id')) {
            $query->whereHas('project.chapter', function ($q) use ($request) {
                $q->where('branch_id', $request->branch_id);
            });
        }

        // فلترة 2: حسب تاريخ معين (تاريخ الإنشاء)
        if ($request->has('date')) {
            $query->whereDate('created_at', $request->date);
        }

        // إخفاء المسودات (التي لم تُرسل بعد)
        $query->whereIn('status', ['Submitted', 'Reviewed']);

        // ترتيب من الأحدث للأقدم
        $reports = $query->latest()->get();

        return response()->json([
            'message' => 'System reports retrieved successfully',
            'data' => $reports
        ]);
    }

    /**
     * عرض تفاصيل تقرير محدد
     * GET /api/reports/{report_id}
     */
    public function show($id)
    {
        $report = ProjectReport::with(['project.chapter.branch', 'submitter', 'forwardedTo'])->findOrFail($id);
        
        return response()->json([
            'message' => 'Report details retrieved successfully',
            'data' => $report
        ]);
    }
}