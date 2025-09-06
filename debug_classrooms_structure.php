<?php
/**
 * Test script to debug Classrooms controller response
 */

// Mock the Laravel environment
define('LARAVEL_START', microtime(true));
require_once __DIR__ . '/vendor/autoload.php';

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

    echo "=== Testing ClassroomController Response Structure ===\n";
    
    // Simulate the controller's index method
    $classrooms = App\Models\Classroom::with(['subjects', 'teachers', 'students'])
        ->withCount(['students', 'subjects'])
        ->latest()
        ->paginate(15)
        ->withQueryString();
    
    echo "Classrooms object type: " . get_class($classrooms) . "\n";
    echo "Items method exists: " . (method_exists($classrooms, 'items') ? 'Yes' : 'No') . "\n";
    echo "Items type: " . gettype($classrooms->items()) . "\n";
    echo "Items is array: " . (is_array($classrooms->items()) ? 'Yes' : 'No') . "\n";
    echo "Items count: " . count($classrooms->items()) . "\n";
    
    echo "\n=== Pagination Properties ===\n";
    echo "Total: " . $classrooms->total() . "\n";
    echo "Current page: " . $classrooms->currentPage() . "\n";
    echo "Per page: " . $classrooms->perPage() . "\n";
    echo "Has links: " . (method_exists($classrooms, 'links') ? 'Yes' : 'No') . "\n";
    
    echo "\n=== Sample Data Structure ===\n";
    if (count($classrooms->items()) > 0) {
        $firstClassroom = $classrooms->items()[0];
        echo "First classroom keys: " . implode(', ', array_keys($firstClassroom->toArray())) . "\n";
        echo "Students count: " . $firstClassroom->students_count . "\n";
        echo "Subjects count: " . $firstClassroom->subjects_count . "\n";
    }
    
    echo "\n=== toArray() Structure (first 500 chars) ===\n";
    $array = $classrooms->toArray();
    echo "Array keys: " . implode(', ', array_keys($array)) . "\n";
    $json = json_encode($array);
    echo substr($json, 0, 500) . "...\n";
    
    echo "\n✅ Debug completed!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
