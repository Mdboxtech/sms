<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use App\Models\Classroom;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    echo "=== Testing Classroom Model ===\n";
    
    // Test the raw query
    $classrooms = Classroom::with(['students', 'subjects'])->paginate(15);
    
    echo "Paginated result type: " . gettype($classrooms) . "\n";
    echo "Paginated result class: " . get_class($classrooms) . "\n";
    
    echo "\nConverting to array...\n";
    $array = $classrooms->toArray();
    
    echo "Array keys: " . implode(', ', array_keys($array)) . "\n";
    
    if (isset($array['data'])) {
        echo "Data type: " . gettype($array['data']) . "\n";
        echo "Data is array: " . (is_array($array['data']) ? 'Yes' : 'No') . "\n";
        echo "Data count: " . count($array['data']) . "\n";
        
        if (!empty($array['data'])) {
            echo "\nFirst classroom data:\n";
            var_dump($array['data'][0]);
        }
    }
    
    if (isset($array['links'])) {
        echo "\nLinks type: " . gettype($array['links']) . "\n";
        echo "Links is array: " . (is_array($array['links']) ? 'Yes' : 'No') . "\n";
        if (is_array($array['links'])) {
            echo "Links count: " . count($array['links']) . "\n";
            if (!empty($array['links'])) {
                echo "First link:\n";
                var_dump($array['links'][0]);
            }
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
