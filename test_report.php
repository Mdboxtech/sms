<?php

// Test script to verify report card generation and check logo handling
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Term;
use App\Models\Student;
use App\Models\Result;
use App\Models\Setting;
use App\Services\ReportCardService;

try {
    echo "=== Report Card Testing ===\n";
    
    // Check specific settings
    echo "Settings Check:\n";
    echo "- School Name: " . Setting::getValue('school_name', 'NOT SET') . "\n";
    echo "- School Logo: " . Setting::getValue('school_logo', 'NOT SET') . "\n";
    echo "- Primary Color: " . Setting::getValue('school_primary_color', 'NOT SET') . "\n";
    echo "\n";

    // Find test data
    $term = Term::first();
    $student = Student::whereHas('results', function($query) use ($term) {
        $query->where('term_id', $term->id);
    })->first();

    if (!$term || !$student) {
        echo "❌ No test data found\n";
        exit(1);
    }

    echo "Test Data:\n";
    echo "- Term: {$term->name}\n";
    echo "- Student: {$student->user->first_name} {$student->user->last_name}\n";
    echo "\n";

    // Test report generation
    $service = new ReportCardService();
    $pdf = $service->generateReportCard($student, $term);
    
    $pdfSize = strlen($pdf->output());
    echo "✅ Report card generated successfully!\n";
    echo "📄 PDF size: {$pdfSize} bytes\n";
    
    // Check if size is reasonable (should be > 5KB for a proper report)
    if ($pdfSize > 5000) {
        echo "✅ PDF size looks good\n";
    } else {
        echo "⚠️  PDF size seems small, might be missing content\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "📍 File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
    exit(1);
}
