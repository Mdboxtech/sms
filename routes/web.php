<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Http\Controllers\TermController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportCardController;
use App\Http\Controllers\AcademicSessionController;
use App\Http\Controllers\AIController;
use App\Http\Controllers\TermResultController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Profile routes (accessible by all authenticated users)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Admin routes
    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'adminDashboard'])->name('dashboard');
        Route::get('/calendar', fn() => Inertia::render('Admin/Calendar'))->name('calendar');
        Route::resource('classrooms', ClassroomController::class);
        Route::resource('subjects', SubjectController::class);
        Route::resource('students', StudentController::class);
        Route::resource('teachers', TeacherController::class);
        Route::post('/teachers/assign/subject', [TeacherController::class, 'assignSubject'])->name('teachers.assign.subject');
        Route::post('/teachers/assign/classroom', [TeacherController::class, 'assignClassroom'])->name('teachers.assign.classroom');
        Route::post('/teachers/remove/subject', [TeacherController::class, 'removeSubject'])->name('teachers.remove.subject');
        Route::post('/teachers/remove/classroom', [TeacherController::class, 'removeClassroom'])->name('teachers.remove.classroom');
        Route::resource('terms', TermController::class);
        Route::resource('sessions', AcademicSessionController::class);
        Route::put('sessions/{session}/toggle', [AcademicSessionController::class, 'toggle'])->name('sessions.toggle');
        Route::resource('results', ResultController::class);
        Route::get('classroom/{classroom}/students', [ResultController::class, 'getStudentsByClassroom'])->name('classroom.students');

        // AI routes
        Route::post('/ai/analyze-performance', [AIController::class, 'analyzePerformance'])->name('api.ai.analyze-performance');
        Route::post('/ai/generate-remark', [AIController::class, 'remark'])->name('api.ai.generate-remark');

        // Term Results Management
        Route::resource('term-results', TermResultController::class)->only(['show']);
        Route::patch('term-results/{termResult}/comments', [TermResultController::class, 'updateComments'])->name('term-results.comments');
        Route::post('term-results/get-or-create', [TermResultController::class, 'getOrCreate'])->name('term-results.get-or-create');
        Route::post('term-results/bulk-create', [TermResultController::class, 'bulkCreate'])->name('term-results.bulk-create');
        Route::post('term-results/recalculate', [TermResultController::class, 'recalculate'])->name('term-results.recalculate');
        Route::post('term-results/{termResult}/generate-comments', [TermResultController::class, 'generateDefaultComments'])->name('term-results.generate-comments');
        Route::get('term-results/export', [TermResultController::class, 'export'])->name('term-results.export');




        // Results Management
        Route::prefix('results')->name('results.')->group(function () {
            // Template and Bulk Operations
            Route::get('/template', [ResultController::class, 'downloadTemplate'])->name('template');
            Route::get('/bulk-create', [ResultController::class, 'bulkCreate'])->name('bulk-create');
            Route::post('/bulk-store', [ResultController::class, 'bulkStore'])->name('bulk-store');
            Route::post('/import', [ResultController::class, 'import'])->name('import');
            Route::get('/export', [ResultController::class, 'export'])->name('export');
            Route::get('/download-template', [ResultController::class, 'downloadTemplate'])->name('download-template');
            Route::post('/{result}/update-comments', [ResultController::class, 'updateComments'])->name('update-comments');
            
            // Analysis and Compilation
            Route::get('/compile', [ResultController::class, 'compileIndex'])->name('compile');
            Route::post('/compile', [ResultController::class, 'compile'])->name('compile.process');
            Route::get('/compile/index', [ResultController::class, 'compileIndex'])->name('compile.index');
            Route::get('/analysis', [ResultController::class, 'analysis'])->name('analysis');
            
            // View by different entities
            Route::get('/classroom/{classroom}', [ResultController::class, 'classResults'])->name('classroom');
            Route::get('/student/{student}', [ResultController::class, 'studentResults'])->name('student');
            Route::get('/subject/{subject}', [ResultController::class, 'subjectResults'])->name('subject');
            Route::get('/term/{term}', [ResultController::class, 'termResults'])->name('term');
            Route::get('/teacher/{teacher?}', [ResultController::class, 'teacherResults'])->name('teacher');
            
            // Batch Operations
            Route::post('/bulk-update', [ResultController::class, 'bulkUpdate'])->name('bulk-update');
            Route::post('/generate-remarks', [ResultController::class, 'generateRemarks'])->name('generate-remarks');
        });
        
        Route::post('/students/import', [StudentController::class, 'import'])->name('students.import');
        Route::get('/students/export', [StudentController::class, 'export'])->name('students.export');
    });

    // Teacher routes
    Route::middleware(['role:teacher'])->prefix('teacher')->name('teacher.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'teacherDashboard'])->name('dashboard');
        Route::get('/subjects', [SubjectController::class, 'teacherSubjects'])->name('subjects');
        Route::get('/students', [StudentController::class, 'teacherStudents'])->name('students');
        
        // Results Management
        Route::prefix('results')->name('results.')->group(function () {
            Route::get('/', [ResultController::class, 'teacherResults'])->name('index');
            Route::get('/create', [ResultController::class, 'create'])->name('create');
            Route::post('/store', [ResultController::class, 'store'])->name('store');
            Route::get('/{result}/edit', [ResultController::class, 'edit'])->name('edit');
            Route::put('/{result}', [ResultController::class, 'update'])->name('update');
            Route::delete('/{result}', [ResultController::class, 'destroy'])->name('delete');
            Route::post('/bulk-store', [ResultController::class, 'bulkStore'])->name('bulk-store');
            Route::get('/download-template', [ResultController::class, 'downloadTemplate'])->name('template');
            Route::post('/import', [ResultController::class, 'import'])->name('import');
        });
    });

    // Student routes
    Route::middleware(['role:student'])->prefix('student')->name('student.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'studentDashboard'])->name('dashboard');
        Route::get('/results', [ResultController::class, 'studentResults'])->name('results');
        Route::get('/report-card', [ReportCardController::class, 'studentReportCard'])->name('report-card');
    });
});

// Report Card routes
Route::middleware(['auth'])->prefix('report-cards')->name('report-cards.')->group(function () {
    Route::get('/', [ReportCardController::class, 'index'])->name('index');
    Route::post('/generate', [ReportCardController::class, 'generate'])->name('generate');
    Route::post('/download', [ReportCardController::class, 'download'])->name('download');
});

// AI routes with authentication
Route::middleware(['auth'])->prefix('api')->name('api.')->group(function () {
    Route::prefix('ai')->name('ai.')->group(function () {
        Route::post('/remark', [AIController::class, 'remark'])->name('remark');
        Route::post('/analyze-performance', [AIController::class, 'analyzePerformance'])->name('analyze');
        Route::post('/suggest-improvements', [AIController::class, 'suggestImprovements'])->name('suggest');
    });
});

require __DIR__.'/auth.php';
