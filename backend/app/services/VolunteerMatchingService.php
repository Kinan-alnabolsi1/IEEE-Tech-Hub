<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VolunteerMatchingService
{
    // أوزان الخوارزمية حسب اتفاقنا
    private const WEIGHT_SKILLS = 0.35;      // 35% للمهارات
    private const WEIGHT_NLP = 0.15;         // 15% للتشابه النصي (AI)
    private const WEIGHT_EXPERIENCE = 0.15;  // 15% لسنوات الخبرة
    private const WEIGHT_PERFORMANCE = 0.15; // 15% للتقييم السابق
    private const WEIGHT_AVAILABILITY = 0.20;// 20% للتفرغ (عدد المهام الحالية)

    // رابط سيرفر الذكاء الاصطناعي (البايثون)
    private const AI_API_URL = 'http://127.0.0.1:5000/similarity';

    /**
     * حساب التوصيات لدور محدد في مشروع
     */
    public function getRecommendationsForRole(Project $project, string $roleName)
    {
        // 1. جلب المتطوعين مع علاقة tasks الصحيحة
        $applicants = $project->members()
            ->wherePivot('role', $roleName)
            ->wherePivot('status', 'Pending')
            ->with(['skills', 'tasks']) // 👈 التعديل الأول: استخدمنا tasks 
            ->get();

        if ($applicants->isEmpty()) {
            return []; // لا يوجد متقدمين لهذا الدور
        }

        // 2. تجهيز البيانات لإرسالها لـ AI (البايثون) دفعة واحدة
        $candidateBios = [];
        foreach ($applicants as $applicant) {
            $candidateBios[] = $applicant->bio ?? ''; // إرسال نص فارغ إن لم يوجد لتجنب الأخطاء
        }

        // 3. الاتصال بـ Python API لجلب سكور التشابه النصي
        $nlpScores = $this->fetchNlpScores($project->description ?? '', $candidateBios);

        // 4. حساب السكور الشامل لكل متطوع
        $rankedCandidates = [];
        $projectSkills = $project->requiredSkills;

        foreach ($applicants as $index => $applicant) {
            // أ. سكور المهارات (من 100)
            $skillScore = $this->calculateSkillScore($projectSkills, $applicant->skills);

            // ب. سكور التشابه النصي (من 100)
            $nlpScore = ($nlpScores[$index] ?? 0) * 100; 

            // ج. سكور التقييم السابق (من 100)
            $performanceScore = $this->calculatePerformanceScore($applicant);

            // د. سكور الخبرة (من 100)
            $experienceScore = $this->calculateExperienceScore($applicant->skills);

            // هـ. سكور التفرغ (من 100)
            $availabilityScore = $this->calculateAvailabilityScore($applicant);

            // 🧮 الحساب النهائي (Final Score)
            $finalScore = 
                ($skillScore * self::WEIGHT_SKILLS) +
                ($nlpScore * self::WEIGHT_NLP) +
                ($experienceScore * self::WEIGHT_EXPERIENCE) +
                ($performanceScore * self::WEIGHT_PERFORMANCE) +
                ($availabilityScore * self::WEIGHT_AVAILABILITY);

            // حفظ النتيجة للمتطوع
            $rankedCandidates[] = [
                'user_id' => $applicant->user_id,
                'full_name' => $applicant->full_name,
                'profile_photo' => $applicant->profile_photo,
                'role' => $roleName,
                'scores_breakdown' => [
                    'skills_match' => round($skillScore, 1),
                    'ai_bio_match' => round($nlpScore, 1),
                    'experience' => round($experienceScore, 1),
                    'performance' => round($performanceScore, 1),
                    'availability' => round($availabilityScore, 1),
                ],
                'final_score' => round($finalScore, 1)
            ];
        }

        // 5. ترتيب المصفوفة من الأعلى إلى الأقل
        usort($rankedCandidates, function ($a, $b) {
            return $b['final_score'] <=> $a['final_score'];
        });

        // 6. إرجاع أفضل 3 متطوعين
        return array_slice($rankedCandidates, 0, 3);
    }

    /**
     * دالة التواصل مع سيرفر Python
     */
    private function fetchNlpScores(string $projectDescription, array $bios): array
    {
        try {
            $response = Http::timeout(10)->post(self::AI_API_URL, [
                'project_description' => $projectDescription,
                'candidate_bios' => $bios
            ]);

            if ($response->successful()) {
                return $response->json('similarities');
            }
        } catch (\Exception $e) {
            Log::error('AI Python Service Error: ' . $e->getMessage());
        }

        return array_fill(0, count($bios), 0);
    }

    /**
     * حساب تطابق المهارات
     */
    private function calculateSkillScore($projectSkills, $userSkills): float
    {
        if ($projectSkills->isEmpty()) return 100;

        $totalRequired = $projectSkills->count();
        $earnedPoints = 0;

        foreach ($projectSkills as $pSkill) {
            $exactMatch = $userSkills->firstWhere('skill_id', $pSkill->skill_id);

            if ($exactMatch) {
                $earnedPoints += 1;
            } else {
                $categoryMatch = $userSkills->firstWhere('category', $pSkill->category);
                if ($categoryMatch) {
                    $earnedPoints += 0.5;
                }
            }
        }

        return ($earnedPoints / $totalRequired) * 100;
    }

    /**
     * حساب التقييم السابق بناءً على نسبة الإنجاز
     */
    private function calculatePerformanceScore(User $user): float
    {
        // 👈 التعديل الثاني: الاعتماد على جدول المهام pivot لجلب نسبة الإنجاز
        $tasksWithProgress = $user->tasks->whereNotNull('pivot.completion_pct');
        
        if ($tasksWithProgress->isEmpty()) {
            return 70; // سكور حيادي إذا لم تكن هناك مهام سابقة
        }

        return (float) $tasksWithProgress->avg('pivot.completion_pct');
    }

    /**
     * حساب سكور الخبرة
     */
    private function calculateExperienceScore($userSkills): float
    {
        if ($userSkills->isEmpty()) return 0;

        $maxYears = $userSkills->max('pivot.experience_years') ?? 0;
        $score = ($maxYears / 5) * 100;

        return $score > 100 ? 100 : $score;
    }

    /**
     * حساب سكور التفرغ
     */
    private function calculateAvailabilityScore(User $user): float
    {
        // 👈 التعديل الثالث: استخدام علاقة tasks مع فلترة حالة المهمة مباشرة من الداتابيز
        $activeTasksCount = $user->tasks()
            ->whereIn('tasks.status', ['Open', 'In Progress'])
            ->count();

        $score = 100 - ($activeTasksCount * 20);

        return $score < 0 ? 0 : $score;
    }
}