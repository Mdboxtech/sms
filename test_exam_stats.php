<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    $exam = App\Models\Exam::first();
    
    if (!$exam) {
        echo "No exams found in database\n";
        exit(0);
    }
    
    echo "Testing exam statistics for exam ID: " . $exam->id . "\n";
    
    $cbtService = new App\Services\CBTService();
    $stats = $cbtService->getExamStatistics($exam);
    
    echo "Statistics retrieved successfully!\n";
    print_r($stats);
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
