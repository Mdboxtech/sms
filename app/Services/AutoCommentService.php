<?php

namespace App\Services;

class AutoCommentService
{
    /**
     * Generate automatic teacher comment based on student performance
     */
    public function generateTeacherComment($averageScore, $results = [])
    {
        if ($averageScore >= 80) {
            return "Excellent performance! {$this->getStrengthComment($results)} Keep up the outstanding work and continue to aim higher.";
        } elseif ($averageScore >= 70) {
            return "Very good performance! {$this->getStrengthComment($results)} With a little more effort, you can achieve excellence.";
        } elseif ($averageScore >= 60) {
            return "Good performance! {$this->getStrengthComment($results)} Continue working hard and focus on areas that need improvement.";
        } elseif ($averageScore >= 50) {
            return "Fair performance. {$this->getImprovementComment($results)} With more dedication and focused study, you can achieve better results.";
        } elseif ($averageScore >= 40) {
            return "Below average performance. {$this->getImprovementComment($results)} You need to put in more effort and seek help where necessary.";
        } else {
            return "Poor performance. {$this->getImprovementComment($results)} Immediate attention and support are needed to improve academic standing.";
        }
    }

    /**
     * Generate automatic principal comment based on student performance
     */
    public function generatePrincipalComment($averageScore, $results = [])
    {
        if ($averageScore >= 80) {
            return "Outstanding academic achievement! You are a role model for other students. Continue to excel and inspire others.";
        } elseif ($averageScore >= 70) {
            return "Commendable performance! Your hard work is paying off. Maintain this momentum and strive for excellence.";
        } elseif ($averageScore >= 60) {
            return "Good effort shown. Keep working diligently and you will achieve greater success in your academic journey.";
        } elseif ($averageScore >= 50) {
            return "Satisfactory performance. Focus on your studies and utilize all available resources to improve your academic standing.";
        } elseif ($averageScore >= 40) {
            return "You need to improve your academic performance. Seek guidance from teachers and dedicate more time to your studies.";
        } else {
            return "Serious academic intervention is required. Please work closely with your teachers and parents to develop an improvement plan.";
        }
    }

    /**
     * Get comment highlighting strengths based on best performing subjects
     */
    private function getStrengthComment($results)
    {
        if (empty($results)) {
            return "You have shown good understanding across subjects.";
        }

        $excellentSubjects = [];
        $goodSubjects = [];

        foreach ($results as $result) {
            $score = $result['total_score'] ?? ($result->total_score ?? 0);
            $subjectName = $result['subject']['name'] ?? ($result->subject->name ?? 'Unknown Subject');

            if ($score >= 80) {
                $excellentSubjects[] = $subjectName;
            } elseif ($score >= 70) {
                $goodSubjects[] = $subjectName;
            }
        }

        if (!empty($excellentSubjects)) {
            return "Particularly excellent in " . $this->formatSubjectList($excellentSubjects) . ".";
        } elseif (!empty($goodSubjects)) {
            return "Strong performance in " . $this->formatSubjectList($goodSubjects) . ".";
        }

        return "You have shown consistent effort across subjects.";
    }

    /**
     * Get comment highlighting areas for improvement
     */
    private function getImprovementComment($results)
    {
        if (empty($results)) {
            return "Focus on improving your study habits and seek help when needed.";
        }

        $weakSubjects = [];

        foreach ($results as $result) {
            $score = $result['total_score'] ?? ($result->total_score ?? 0);
            $subjectName = $result['subject']['name'] ?? ($result->subject->name ?? 'Unknown Subject');

            if ($score < 50) {
                $weakSubjects[] = $subjectName;
            }
        }

        if (!empty($weakSubjects)) {
            return "Pay special attention to " . $this->formatSubjectList($weakSubjects) . ".";
        }

        return "Focus on consistent study habits across all subjects.";
    }

    /**
     * Format list of subjects for comments
     */
    private function formatSubjectList($subjects)
    {
        if (count($subjects) == 1) {
            return $subjects[0];
        } elseif (count($subjects) == 2) {
            return $subjects[0] . ' and ' . $subjects[1];
        } else {
            $lastSubject = array_pop($subjects);
            return implode(', ', $subjects) . ', and ' . $lastSubject;
        }
    }

    /**
     * Generate both teacher and principal comments for a student
     */
    public function generateBothComments($averageScore, $results = [])
    {
        return [
            'teacher_comment' => $this->generateTeacherComment($averageScore, $results),
            'principal_comment' => $this->generatePrincipalComment($averageScore, $results)
        ];
    }
}
