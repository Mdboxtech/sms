<?php

namespace Tests\Unit;

use App\Http\Controllers\ReportCardController;
use App\Models\Result;
use Mockery;
use Tests\TestCase;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ReportCardControllerTest extends TestCase
{
    protected $controller;

    protected function setUp(): void
    {
        parent::setUp();
        $this->controller = new ReportCardController();
    }
    
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /** @test */
    public function it_calculates_correct_position_when_student_has_highest_score()
    {
        // Create a mock of the Result class
        $resultMock = Mockery::mock('overload:App\\Models\\Result');
        
        // Mock the where method chain
        $resultMock->shouldReceive('where')->once()->with('term_id', 1)->andReturnSelf();
        $resultMock->shouldReceive('select')->once()->with('student_id')->andReturnSelf();
        $resultMock->shouldReceive('selectRaw')->once()->with('SUM(total_score) as total_score')->andReturnSelf();
        $resultMock->shouldReceive('groupBy')->once()->with('student_id')->andReturnSelf();
        $resultMock->shouldReceive('orderByDesc')->once()->with('total_score')->andReturnSelf();
        
        // Mock the get method to return our test data
        $resultMock->shouldReceive('get')->once()->andReturn(collect([
            (object)['student_id' => 1, 'total_score' => 100], // Our student with highest score
            (object)['student_id' => 2, 'total_score' => 80],  // Another student with lower score
        ]));

        // Call the calculatePosition method
        $position = $this->controller->calculatePosition(1, 1); // Using ID 1 for student and term

        $this->assertEquals(1, $position, 'Student should be in position 1 (first place)');
    }

    // Removed duplicate method

    /** @test */
    public function it_calculates_correct_position_when_student_has_lowest_score()
    {
        // Create a mock of the Result class
        $resultMock = Mockery::mock('overload:App\\Models\\Result');
        
        // Mock the where method chain
        $resultMock->shouldReceive('where')->once()->with('term_id', 1)->andReturnSelf();
        $resultMock->shouldReceive('select')->once()->with('student_id')->andReturnSelf();
        $resultMock->shouldReceive('selectRaw')->once()->with('SUM(total_score) as total_score')->andReturnSelf();
        $resultMock->shouldReceive('groupBy')->once()->with('student_id')->andReturnSelf();
        $resultMock->shouldReceive('orderByDesc')->once()->with('total_score')->andReturnSelf();
        
        // Mock the get method to return our test data
        $resultMock->shouldReceive('get')->once()->andReturn(collect([
            (object)['student_id' => 2, 'total_score' => 90], // Student with highest score
            (object)['student_id' => 3, 'total_score' => 85], // Student with middle score
            (object)['student_id' => 1, 'total_score' => 50], // Our student with lowest score
        ]));

        // Call the calculatePosition method
        $position = $this->controller->calculatePosition(1, 1); // Using ID 1 for student and term

        // Student with lowest score should be in position 3 (last place)
        $this->assertEquals(3, $position, 'Student with lowest score should be in last position');
    }

    /** @test */
    public function it_calculates_correct_position_when_students_have_tied_scores()
    {
        // Create a mock of the Result class
        $resultMock = Mockery::mock('overload:App\\Models\\Result');
        
        // Mock the where method chain
        $resultMock->shouldReceive('where')->once()->with('term_id', 1)->andReturnSelf();
        $resultMock->shouldReceive('select')->once()->with('student_id')->andReturnSelf();
        $resultMock->shouldReceive('selectRaw')->once()->with('SUM(total_score) as total_score')->andReturnSelf();
        $resultMock->shouldReceive('groupBy')->once()->with('student_id')->andReturnSelf();
        $resultMock->shouldReceive('orderByDesc')->once()->with('total_score')->andReturnSelf();
        
        // Mock the get method to return our test data
        $resultMock->shouldReceive('get')->once()->andReturn(collect([
            (object)['student_id' => 1, 'total_score' => 80], // Our student with tied score
            (object)['student_id' => 2, 'total_score' => 80], // Another student with tied score
            (object)['student_id' => 3, 'total_score' => 70], // Student with lower score
        ]));

        // Call the calculatePosition method
        $position = $this->controller->calculatePosition(1, 1); // Using ID 1 for student and term

        // Both students should be tied for position 1
        $this->assertEquals(1, $position, 'Students with tied scores should have the same position');
    }
    
    /** @test */
    public function it_returns_correct_position_when_student_has_no_results()
    {
        // Create a mock of the Result class
        $resultMock = Mockery::mock('overload:App\\Models\\Result');
        
        // Mock the where method chain
        $resultMock->shouldReceive('where')->once()->with('term_id', 1)->andReturnSelf();
        $resultMock->shouldReceive('select')->once()->with('student_id')->andReturnSelf();
        $resultMock->shouldReceive('selectRaw')->once()->with('SUM(total_score) as total_score')->andReturnSelf();
        $resultMock->shouldReceive('groupBy')->once()->with('student_id')->andReturnSelf();
        $resultMock->shouldReceive('orderByDesc')->once()->with('total_score')->andReturnSelf();
        
        // Mock the get method to return our test data
        $resultMock->shouldReceive('get')->once()->andReturn(collect([
            (object)['student_id' => 2, 'total_score' => 80], // Another student with results
            // Our student (ID 1) has no results so doesn't appear in the collection
        ]));

        // Call the calculatePosition method
        $position = $this->controller->calculatePosition(1, 1); // Using ID 1 for student and term

        // Student with no results should be in last position
        $this->assertEquals(2, $position, 'Student with no results should be in last position');
    }
}