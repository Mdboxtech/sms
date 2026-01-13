<?php
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "🔧 Testing Admin Report Card Logo Fix...\n\n";

// Check if we have students and terms
$student = App\Models\Student::first();
$term = App\Models\Term::first();

if (!$student || !$term) {
    echo "❌ No students or terms found. Please add some test data first.\n";
    exit(1);
}

echo "📋 Using Student: {$student->user->name} (ID: {$student->id})\n";
echo "📅 Using Term: {$term->name} (ID: {$term->id})\n\n";

// Check settings
echo "🔍 Checking Settings...\n";
$settings = [
    'school_name' => App\Models\Setting::getValue('school_name'),
    'school_logo' => App\Models\Setting::getValue('school_logo'),
    'school_address' => App\Models\Setting::getValue('school_address'),
];

foreach ($settings as $key => $value) {
    echo "   {$key}: " . ($value ? "✅ {$value}" : "❌ Not set") . "\n";
}

// Test the ReportCardService directly
echo "\n🎯 Testing ReportCardService...\n";
try {
    $service = new App\Services\ReportCardService();
    $pdf = $service->generateReportCard($student, $term);
    
    echo "✅ ReportCardService generated PDF successfully!\n";
    echo "   PDF Size: " . strlen($pdf->output()) . " bytes\n";
    
    // Save test PDF to verify logo
    $pdfContent = $pdf->output();
    file_put_contents('test_admin_logo.pdf', $pdfContent);
    echo "   Test PDF saved as: test_admin_logo.pdf\n";
    
} catch (Exception $e) {
    echo "❌ ReportCardService failed: " . $e->getMessage() . "\n";
    echo "   Stack trace: " . $e->getTraceAsString() . "\n";
}

// Test the controller method by simulating the request
echo "\n🎯 Testing Admin Controller Method...\n";
try {
    $request = new Illuminate\Http\Request([
        'student_id' => $student->id,
        'term_id' => $term->id,
    ]);
    
    $controller = new App\Http\Controllers\ReportCardController(new App\Services\ReportCardService());
    $response = $controller->download($request);
    
    echo "✅ Admin report card controller worked!\n";
    echo "   Response type: " . get_class($response) . "\n";
    
    // Check response headers
    if (method_exists($response, 'headers')) {
        $headers = $response->headers->all();
        echo "   Content-Type: " . ($headers['content-type'][0] ?? 'Unknown') . "\n";
        if (isset($headers['content-length'])) {
            echo "   Content-Length: " . $headers['content-length'][0] . " bytes\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Admin controller failed: " . $e->getMessage() . "\n";
    echo "   Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n🔍 Checking Logs for Logo Processing...\n";
$logFile = storage_path('logs/laravel.log');
if (file_exists($logFile)) {
    $logs = file_get_contents($logFile);
    $recentLogs = array_slice(explode("\n", $logs), -20);
    
    foreach ($recentLogs as $line) {
        if (stripos($line, 'app settings') !== false || stripos($line, 'school_logo') !== false) {
            echo "   📝 " . trim($line) . "\n";
        }
    }
} else {
    echo "   ❌ Log file not found\n";
}

echo "\n✅ Admin logo fix test completed!\n";
?>
