<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use App\Http\Controllers\ClassroomController;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Create a fake request
$request = Request::create('/admin/classrooms', 'GET');

// Create controller instance
$controller = new ClassroomController();

try {
    echo "=== Testing ClassroomController index method ===\n";
    
    // Call the controller method
    $response = $controller->index($request);
    
    echo "Response type: " . gettype($response) . "\n";
    echo "Response class: " . get_class($response) . "\n";
    
    // Get the response data for Inertia
    $data = $response->toResponse($request)->getData();
    echo "Data type: " . gettype($data) . "\n";
    
    if (isset($data['props'])) {
        echo "\nProps found:\n";
        var_dump(array_keys($data['props']));
        
        if (isset($data['props']['classrooms'])) {
            $classrooms = $data['props']['classrooms'];
            echo "\nClassrooms type: " . gettype($classrooms) . "\n";
            
            if (is_object($classrooms)) {
                echo "Classrooms class: " . get_class($classrooms) . "\n";
                echo "Classrooms methods: " . implode(', ', get_class_methods($classrooms)) . "\n";
                
                // Check if it's a paginator
                if (method_exists($classrooms, 'toArray')) {
                    $classroomsArray = $classrooms->toArray();
                    echo "\nClassrooms array keys: " . implode(', ', array_keys($classroomsArray)) . "\n";
                    
                    if (isset($classroomsArray['data'])) {
                        echo "Data type: " . gettype($classroomsArray['data']) . "\n";
                        echo "Data count: " . count($classroomsArray['data']) . "\n";
                        
                        if (!empty($classroomsArray['data'])) {
                            echo "\nFirst classroom:\n";
                            var_dump($classroomsArray['data'][0]);
                        }
                    }
                }
            } elseif (is_array($classrooms)) {
                echo "Classrooms is array with " . count($classrooms) . " items\n";
                if (!empty($classrooms)) {
                    echo "\nFirst classroom:\n";
                    var_dump($classrooms[0]);
                }
            }
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
