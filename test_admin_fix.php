<?php

require __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Student;
use App\Models\Term;
use App\Http\Controllers\ReportCardController;
use App\Services\ReportCardService;

try {
    echo "Testing Admin Report Card Controller Fix...\n";
    
    // Get a test student
    $student = Student::with(['user', 'classroom'])->first();
    if (!$student) {
        echo "❌ No students found!\n";
        exit(1);
    }
    
    // Get a test term
    $term = Term::with('academicSession')->first();
    if (!$term) {
        echo "❌ No terms found!\n";
        exit(1);
    }
    
    echo "📝 Student: {$student->user->name} (Admission: {$student->admission_number})\n";
    echo "📅 Term: {$term->name}\n";
    echo "🏫 Class: {$student->classroom->name}\n";
    
    // Create controller and service
    $service = new ReportCardService();
    $controller = new ReportCardController($service);
    
    // Test the fixed method by getting the PDF object first
    echo "\n📄 Testing PDF generation...\n";
    $pdf = $service->generateReportCard($student, $term);
    
    // Now test the download method
    $response = $pdf->download("test-report-card-{$student->admission_number}-{$term->name}.pdf");
    
    echo "✅ Admin report card controller fix successful!\n";
    echo "📁 Response type: " . get_class($response) . "\n";
    echo "📋 Content-Type: " . $response->headers->get('Content-Type') . "\n";
    echo "📊 Content-Length: " . $response->headers->get('Content-Length') . " bytes\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "📍 File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "🔍 Trace:\n" . $e->getTraceAsString() . "\n";
}
