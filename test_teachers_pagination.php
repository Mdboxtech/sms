<?php
/**
 * Test script to verify Teachers pagination and search functionality
 */

// Mock the Laravel environment
define('LARAVEL_START', microtime(true));
require_once __DIR__ . '/vendor/autoload.php';

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

    // Test 1: Paginated Teachers Query
    echo "=== Test 1: Teachers Pagination ===\n";
    
    $teachers = App\Models\Teacher::with(['user', 'subjects', 'classrooms'])
        ->paginate(15);
    
    echo "Total teachers: {$teachers->total()}\n";
    echo "Current page: {$teachers->currentPage()}\n";
    echo "Per page: {$teachers->perPage()}\n";
    echo "Last page: {$teachers->lastPage()}\n";
    echo "From: {$teachers->firstItem()}\n";
    echo "To: {$teachers->lastItem()}\n";
    echo "Has pages: " . ($teachers->hasPages() ? "Yes" : "No") . "\n";
    
    // Test 2: Teachers Search Query
    echo "\n=== Test 2: Teachers Search ===\n";
    
    $searchTerms = ['john', 'teacher', 'emp'];
    foreach ($searchTerms as $term) {
        $searchResults = App\Models\Teacher::with(['user', 'subjects', 'classrooms'])
            ->whereHas('user', function($query) use ($term) {
                $query->where('name', 'like', "%{$term}%")
                      ->orWhere('email', 'like', "%{$term}%");
            })
            ->orWhere('employee_id', 'like', "%{$term}%")
            ->orWhere('qualification', 'like', "%{$term}%")
            ->paginate(15);
        
        echo "Search term '{$term}': {$searchResults->total()} results\n";
    }
    
    // Test 3: Individual Teacher Data Structure
    echo "\n=== Test 3: Teacher Data Structure ===\n";
    
    $firstTeacher = App\Models\Teacher::with(['user', 'subjects', 'classrooms'])->first();
    if ($firstTeacher) {
        echo "Teacher ID: {$firstTeacher->id}\n";
        echo "User Name: {$firstTeacher->user->name}\n";
        echo "User Email: {$firstTeacher->user->email}\n";
        echo "Employee ID: {$firstTeacher->employee_id}\n";
        echo "Subjects count: " . $firstTeacher->subjects->count() . "\n";
        echo "Classrooms count: " . $firstTeacher->classrooms->count() . "\n";
        
        // Test pagination links structure
        $paginatedTeachers = App\Models\Teacher::with(['user', 'subjects', 'classrooms'])->paginate(15);
        echo "\n=== Pagination Links Structure ===\n";
        echo "Has links: " . (method_exists($paginatedTeachers, 'links') ? "Yes" : "No") . "\n";
        echo "Links method available: " . (method_exists($paginatedTeachers, 'links') ? "Yes" : "No") . "\n";
    } else {
        echo "No teachers found in database\n";
    }
    
    echo "\n✅ All tests completed successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
