<?php

namespace App\Http\Controllers;

use App\Models\Society;
use Illuminate\Http\Request;

class SocietyController extends Controller
{
    // 1. جلب جميع الجمعيات (مع الفلترة حسب الحالة)
    public function index(Request $request)
    {
        $query = Society::query();

        // إضافة الفلتر: إذا تم تمرير ?status=Active في الرابط
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // جلب البيانات (مرتبة من الأحدث للأقدم)
        $societies = $query->latest()->get();

        return response()->json([
            'message' => 'Societies retrieved successfully',
            'data' => $societies
        ]);
    }

    // 2. إنشاء جمعية جديدة
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150|unique:societies,name', // أضفت unique لمنع تكرار اسم الجمعية
            'abbreviation' => 'nullable|string|max:20',
            'classification' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:Active,Inactive'
        ]);

        $society = Society::create($validated);

        return response()->json([
            'message' => 'Society created successfully', 
            'data' => $society
        ], 201);
    }

    // 3. جلب تفاصيل جمعية محددة بالـ ID
    public function show($id)
    {
        // استخدام findOrFail بفضل تحديد primaryKey في الموديل
        $society = Society::findOrFail($id);

        return response()->json([
            'message' => 'Society retrieved successfully', 
            'data' => $society
        ]);
    }

    // 4. تعديل بيانات الجمعية
    public function update(Request $request, $id)
    {
        $society = Society::findOrFail($id);

        $validated = $request->validate([
            // استثناء الـ ID الحالي من قاعدة unique حتى لا يضرب خطأ إذا لم نغير الاسم
            'name' => 'sometimes|string|max:150|unique:societies,name,' . $id . ',society_id',
            'abbreviation' => 'nullable|string|max:20',
            'classification' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:Active,Inactive'
        ]);

        $society->update($validated);

        return response()->json([
            'message' => 'Society updated successfully', 
            'data' => $society
        ]);
    }

    // 5. حذف جمعية (اختياري للإدارة)
    public function destroy($id)
    {
        $society = Society::findOrFail($id);
        
        // عند الحذف، العلاقات المربوطة بـ cascade في الداتا بيز ستُحذف تلقائياً
        $society->delete();

        return response()->json([
            'message' => 'Society deleted successfully'
        ]);
    }
}