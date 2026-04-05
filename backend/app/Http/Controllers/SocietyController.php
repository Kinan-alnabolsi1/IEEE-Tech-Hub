<?php

namespace App\Http\Controllers;

use App\Models\Society;
use Illuminate\Http\Request;

class SocietyController extends Controller
{
    // جلب جميع الجمعيات
    public function index()
    {
        return response()->json(Society::all());
    }

    // إنشاء جمعية جديدة
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'abbreviation' => 'nullable|string|max:20',
            'classification' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:Active,Inactive'
        ]);

        $society = Society::create($validated);

        return response()->json(['message' => 'Society created successfully', 'data' => $society], 201);
    }

    // تعديل بيانات الجمعية
    public function update(Request $request, $id)
    {
        $society = Society::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:150',
            'abbreviation' => 'nullable|string|max:20',
            'classification' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:Active,Inactive'
        ]);

        $society->update($validated);

        return response()->json(['message' => 'Society updated successfully', 'data' => $society]);
    }

    // حذف جمعية (اختياري للإدارة)
    public function destroy($id)
    {
        $society = Society::findOrFail($id);
        $society->delete();

        return response()->json(['message' => 'Society deleted successfully']);
    }
}