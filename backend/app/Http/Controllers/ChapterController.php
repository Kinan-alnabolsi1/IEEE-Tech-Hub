<?php

namespace App\Http\Controllers;

use App\Models\Chapter;
use App\Models\User;
use App\Http\Requests\CreateChapterRequest;
use Illuminate\Http\Request;

class ChapterController extends Controller
{
    public function index() {
        return response()->json(Chapter::with(['branch', 'society', 'chair'])->get());
    }

    public function store(CreateChapterRequest $request) {
        $validated = $request->validated();
        $chapter = Chapter::create($validated);

        // ترقية صلاحية المستخدم ليصبح Chapter Chair تلقائياً
        if (!empty($validated['chair_id'])) {
            User::where('user_id', $validated['chair_id'])->update(['role' => 'Chapter Chair']);
        }

        return response()->json(['message' => 'Chapter created and chair assigned', 'data' => $chapter], 201);
    }

    public function show($id) {
        return response()->json(Chapter::with(['branch', 'society', 'chair', 'projects'])->findOrFail($id));
    }

    public function update(Request $request, $id) {
        $chapter = Chapter::findOrFail($id);
        $chapter->update($request->all());

        // في حال تم تغيير رئيس الفصل
        if ($request->has('chair_id') && $request->chair_id != null) {
            User::where('user_id', $request->chair_id)->update(['role' => 'Chapter Chair']);
        }

        return response()->json(['message' => 'Chapter updated', 'data' => $chapter]);
    }
}