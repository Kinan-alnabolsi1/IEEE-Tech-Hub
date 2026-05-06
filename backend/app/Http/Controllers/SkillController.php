<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Skill;

class SkillController extends Controller
{
    //
    /**
     * جلب قائمة المهارات المتوفرة في النظام
     * GET /api/skills
     */
    public function index()
    {
        $skills = Skill::all();

        return response()->json([
            'message' => 'Skills retrieved successfully',
            'data' => $skills
        ]);
    }
    
    /**
     * إضافة مهارة جديدة للنظام
     * POST /api/skills
     */
    public function store(Request $request)
    {
        // 1. التحقق من البيانات
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:skills,name',
            'category' => 'nullable|string|max:100'
        ]);

        // 2. إنشاء المهارة
        $skill = Skill::create($validated);

        // 3. إرجاع النتيجة
        return response()->json([
            'message' => 'Skill created successfully',
            'data' => $skill
        ], 201);
    }
}
