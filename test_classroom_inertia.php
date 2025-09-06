<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Classroom;

try {
    echo "=== Direct Classroom Query Test ===\n";
    
    // Test the exact query from the controller
    $classrooms = Classroom::with(['subjects', 'teachers', 'students'])
        ->withCount(['students', 'subjects'])
        ->latest()
        ->paginate(15)
        ->withQueryString();
    
    echo "Query result type: " . gettype($classrooms) . "\n";
    echo "Query result class: " . get_class($classrooms) . "\n";
    
    // Convert to array to see structure
    $array = $classrooms->toArray();
    echo "\nArray structure:\n";
    foreach ($array as $key => $value) {
        echo "- $key: " . gettype($value) . "\n";
        if ($key === 'data' && is_array($value)) {
            echo "  Data items: " . count($value) . "\n";
            if (!empty($value)) {
                echo "  First item keys: " . implode(', ', array_keys($value[0])) . "\n";
            }
        }
        if ($key === 'links' && is_array($value)) {
            echo "  Links items: " . count($value) . "\n";
        }
    }
    
    // Test JSON serialization (what Inertia does)
    echo "\n=== JSON Serialization Test ===\n";
    $json = json_encode($classrooms);
    if ($json === false) {
        echo "JSON encoding failed: " . json_last_error_msg() . "\n";
    } else {
        echo "JSON encoding successful\n";
        $decoded = json_decode($json, true);
        echo "JSON decoded keys: " . implode(', ', array_keys($decoded)) . "\n";
        
        if (isset($decoded['data'])) {
            echo "JSON data type: " . gettype($decoded['data']) . "\n";
            echo "JSON data is array: " . (is_array($decoded['data']) ? 'Yes' : 'No') . "\n";
            echo "JSON data count: " . count($decoded['data']) . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
