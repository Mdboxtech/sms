<?php

namespace Tests\Unit;

use App\Models\Result;
use App\Models\Student;
use App\Services\ReportCardService;
use PHPUnit\Framework\TestCase;

class ReportCardServiceTest extends TestCase
{
    protected $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ReportCardService();
    }

    public function test_can_calculate_grade_for_result()
    {
        $score = 85;
        $grade = $this->service->calculateGrade($score);
        
        $this->assertEquals('A', $grade['grade']);
        $this->assertEquals('Excellent', $grade['remark']);
    }

    public function test_can_calculate_student_average()
    {
        $results = [
            (object)['total_score' => 80],
            (object)['total_score' => 90],
            (object)['total_score' => 70],
        ];

        $average = $this->service->calculateAverage($results);
        $this->assertEquals(80, $average);
    }

    public function test_can_determine_position()
    {
        $scores = [95, 95, 85, 85, 75];
        
        // Both students with 95 should be position 1
        $this->assertEquals(1, $this->service->determinePosition($scores, 95));
        
        // Both students with 85 should be position 3
        $this->assertEquals(3, $this->service->determinePosition($scores, 85));
        
        // Student with 75 should be position 5
        $this->assertEquals(5, $this->service->determinePosition($scores, 75));
    }
}
