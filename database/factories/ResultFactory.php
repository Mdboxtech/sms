<?php

namespace Database\Factories;

use App\Models\Result;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Term;
use Illuminate\Database\Eloquent\Factories\Factory;

class ResultFactory extends Factory
{
    protected $model = Result::class;

    public function definition()
    {
        $caScore = $this->faker->numberBetween(0, 40);
        $examScore = $this->faker->numberBetween(0, 60);
        $totalScore = $caScore + $examScore;
        
        return [
            'student_id' => Student::factory(),
            'subject_id' => Subject::factory(),
            'teacher_id' => Teacher::factory(),
            'term_id' => Term::factory(),
            'ca_score' => $caScore,
            'exam_score' => $examScore,
            'total_score' => $totalScore,
            'remark' => $this->generateRemark($totalScore),
        ];
    }

    protected function generateRemark($totalScore)
    {
        if ($totalScore >= 70) {
            return 'Excellent performance. Keep it up!';
        } elseif ($totalScore >= 60) {
            return 'Very good performance. Continue to work hard.';
        } elseif ($totalScore >= 50) {
            return 'Good performance. More effort needed.';
        } elseif ($totalScore >= 40) {
            return 'Fair performance. Needs to improve.';
        } else {
            return 'Poor performance. Requires significant improvement.';
        }
    }
}