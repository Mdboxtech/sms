<?php

// Test script to verify the updated report card with app_settings
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Term;
use App\Models\Student;
use App\Models\Result;
use App\Services\ReportCardService;

try {
    // Find a term and student with results
    $term = Term::first();
    $student = Student::whereHas('results', function($query) use ($term) {
        $query->where('term_id', $term->id);
    })->first();

    if (!$term || !$student) {
        echo "No term or student with results found for testing.\n";
        exit(1);
    }

    echo "Testing Updated Report Card Generation:\n";
    echo "Term: {$term->name}\n";
    echo "Student: {$student->user->first_name} {$student->user->last_name}\n";

    $service = new ReportCardService();
    
    // Try to generate the PDF (this will test our app_settings and school_info)
    $pdf = $service->generateReportCard($student, $term);
    
    echo "✅ Report card generated successfully!\n";
    echo "PDF size: " . strlen($pdf->output()) . " bytes\n";
    
    // Save a test copy to verify contents
    file_put_contents('test_report_card.pdf', $pdf->output());
    echo "✅ Test PDF saved as test_report_card.pdf\n";
    
} catch (Exception $e) {
    echo "❌ Error generating report card: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
