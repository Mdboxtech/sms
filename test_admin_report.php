<?php

require __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Student;
use App\Models\Term;
use App\Services\ReportCardService;

try {
    echo "Testing Admin Report Card Generation...\n";
    
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
    
    // Test settings retrieval
    echo "\n🔧 Testing Settings:\n";
    $schoolName = \App\Models\Setting::getValue('school_name', 'Default Name');
    $schoolLogo = \App\Models\Setting::getValue('school_logo', null);
    echo "   School Name: {$schoolName}\n";
    echo "   School Logo: " . ($schoolLogo ? "✅ {$schoolLogo}" : "❌ Not set") . "\n";
    
    // Create ReportCardService instance
    $service = new ReportCardService();
    
    // Generate PDF
    echo "\n📄 Generating PDF...\n";
    $pdf = $service->generateReportCard($student, $term);
    
    // Save test PDF
    $filename = "test_admin_report_{$student->admission_number}.pdf";
    file_put_contents($filename, $pdf->output());
    
    $fileSize = filesize($filename);
    echo "✅ Admin report card generated successfully! PDF size: {$fileSize} bytes\n";
    echo "📁 Saved as: {$filename}\n";
    
    // Clean up
    unlink($filename);
    echo "🧹 Test file cleaned up.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "📍 File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
