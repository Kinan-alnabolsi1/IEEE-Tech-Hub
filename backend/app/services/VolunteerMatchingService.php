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
        // 1. جلب المتطوعين اللي قدموا على هاد الدور وحالتهم Pending
        // مع جلب مهاراتهم، ومهامهم السابقة لزوم الحسابات
        $applicants = $project->members()
            ->wherePivot('role', $roleName)
            ->wherePivot('status', 'Pending')
            ->with(['skills', 'taskAssignments']) 
            ->get();

        if ($applicants->isEmpty()) {
            return []; // لا يوجد متقدمين لهذا الدور
        }

        // 2. تجهيز البيانات لإرسالها لـ AI (البايثون) دفعة واحدة
        $candidateBios = [];
        foreach ($applicants as $applicant) {
            // إذا لم يكن لديه نبذة، نضع نص فارغ حتى لا يتعطل الـ AI
            $candidateBios[] = $applicant->bio ?? 'لا توجد نبذة تعريفية.';
        }

        // 3. الاتصال بـ Python API لجلب سكور التشابه النصي
        $nlpScores = $this->fetchNlpScores($project->description ?? '', $candidateBios);

        // 4. حساب السكور الشامل لكل متطوع
        $rankedCandidates = [];
        
        // جلب المهارات المطلوبة للمشروع لمرة واحدة لتوفير الأداء
        $projectSkills = $project->requiredSkills;

        foreach ($applicants as $index => $applicant) {
            // أ. سكور المهارات (من 100)
            $skillScore = $this->calculateSkillScore($projectSkills, $applicant->skills);

            // ب. سكور التشابه النصي (من 100) - نأخذه من مصفوفة الـ Python
            // إذا تعطل البايثون، الـ fetchNlpScores سيرجع مصفوفة أصفار
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

        // 5. ترتيب المصفوفة من الأعلى إلى الأقل بناءً على final_score
        usort($rankedCandidates, function ($a, $b) {
            return $b['final_score'] <=> $a['final_score'];
        });

        // 6. إرجاع أفضل 3 متطوعين (Top 3)
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
                return $response->json('similarities'); // ترجع مصفوفة الأرقام
            }
        } catch (\Exception $e) {
            // في حال كان سيرفر البايثون مطفأ، نسجل الخطأ ونعطي سكور 0 لكي لا يتعطل النظام
            Log::error('AI Python Service Error: ' . $e->getMessage());
        }

        // إذا فشل الاتصال، نرجع مصفوفة أصفار بعدد المتطوعين
        return array_fill(0, count($bios), 0);
    }

    /**
     * حساب تطابق المهارات (Exact Match & Category Match)
     */
    private function calculateSkillScore($projectSkills, $userSkills): float
    {
        if ($projectSkills->isEmpty()) return 100; // إذا المشروع لا يطلب مهارات، الكل يأخذ علامة كاملة

        $totalRequired = $projectSkills->count();
        $earnedPoints = 0;

        foreach ($projectSkills as $pSkill) {
            // البحث عن المهارة لدى المتطوع
            $exactMatch = $userSkills->firstWhere('skill_id', $pSkill->skill_id);

            if ($exactMatch) {
                // تطابق تام
                $earnedPoints += 1;
            } else {
                // لم نجد نفس المهارة، نبحث عن مهارة من نفس الـ Category
                $categoryMatch = $userSkills->firstWhere('category', $pSkill->category);
                if ($categoryMatch) {
                    // تطابق جزئي يعطي نصف نقطة (كما اتفقنا)
                    $earnedPoints += 0.5;
                }
            }
        }

        return ($earnedPoints / $totalRequired) * 100;
    }

    /**
     * حساب التقييم السابق (متوسط إنجاز المهام)
     */
    private function calculatePerformanceScore(User $user): float
    {
        $assignments = $user->taskAssignments;
        
        if ($assignments->isEmpty()) {
            // إذا لم يكن لديه تاريخ سابق، نعطيه رقم حيادي (مثلاً 70%) لكي لا نظلمه
            return 70;
        }

        // حساب متوسط نسبة الإنجاز (completion_pct)
        return (float) $assignments->avg('completion_pct');
    }

    /**
     * حساب سكور الخبرة (حد أقصى 5 سنوات)
     */
    private function calculateExperienceScore($userSkills): float
    {
        if ($userSkills->isEmpty()) return 0;

        // سنأخذ أقصى عدد سنوات خبرة يمتلكها المتطوع في أي مهارة لديه
        // يمكنك تعديل هذا اللوجيك لاحقاً إذا أردت جمع السنوات
        $maxYears = $userSkills->max('pivot.experience_years') ?? 0;

        // نفترض أن 5 سنوات خبرة = 100%
        $score = ($maxYears / 5) * 100;

        return $score > 100 ? 100 : $score; // نقفلها عند 100
    }

    /**
     * حساب سكور التفرغ (التواجدية)
     */
    private function calculateAvailabilityScore(User $user): float
    {
        // نحسب كم مهمة "قيد التنفيذ" (In Progress) أو "مفتوحة" (Open) لديه حالياً
        // كلما زادت المهام، قل السكور
        $activeTasksCount = $user->taskAssignments()
            ->whereHas('task', function($q) {
                $q->whereIn('status', ['Open', 'In Progress']);
            })->count();

        // معادلة بسيطة:
        // 0 مهام = 100%
        // 1 مهمة = 80%
        // 2 مهام = 60%
        // 5 مهام وما فوق = 0% (مضغوط جداً)
        $score = 100 - ($activeTasksCount * 20);

        return $score < 0 ? 0 : $score;
    }
}