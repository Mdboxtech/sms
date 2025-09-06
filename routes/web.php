<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Application;
use App\Http\Controllers\TermController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\ReportCardController;
use App\Http\Controllers\AcademicSessionController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AIController;
use App\Http\Controllers\TermResultController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\Teacher\ResultController as TeacherResultController;
use App\Http\Controllers\Student\ResultController as StudentResultController;

// CBT Controllers
use App\Http\Controllers\Admin\CBT\QuestionController as AdminCBTQuestionController;
use App\Http\Controllers\Admin\CBT\ExamController as AdminCBTExamController;
use App\Http\Controllers\Admin\CBT\ExamScheduleController as AdminCBTExamScheduleController;
use App\Http\Controllers\Admin\CBT\ExamTimetableController as AdminCBTExamTimetableController;
use App\Http\Controllers\Teacher\CBT\QuestionController as TeacherCBTQuestionController;
use App\Http\Controllers\Teacher\CBT\ExamController as TeacherCBTExamController;
use App\Http\Controllers\Student\CBT\ExamController as StudentCBTExamController;
use App\Http\Controllers\Student\CBT\ResultController as StudentCBTResultController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Profile routes (accessible by all authenticated users)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Calendar routes (accessible by all authenticated users)
    Route::prefix('calendar')->name('calendar.')->group(function () {
        Route::get('/', [CalendarController::class, 'index'])->name('index');
        Route::post('/', [CalendarController::class, 'store'])->name('store')->middleware('role:admin,teacher');
        Route::put('/{event}', [CalendarController::class, 'update'])->name('update')->middleware('role:admin,teacher');
        Route::delete('/{event}', [CalendarController::class, 'destroy'])->name('destroy')->middleware('role:admin,teacher');
    });

    // Admin routes
    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'adminDashboard'])->name('dashboard');
        Route::get('/calendar', [CalendarController::class, 'adminIndex'])->name('calendar');
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
       

        // AI routes
        Route::post('/ai/analyze-performance', [AIController::class, 'analyzePerformance'])->name('api.ai.analyze-performance');
        Route::post('/ai/generate-remark', [AIController::class, 'remark'])->name('api.ai.generate-remark');
        Route::post('/ai/auto-comment', [AIController::class, 'autoComment'])->name('api.ai.auto-comment');
       
        // Attendance Management
        Route::prefix('attendance')->name('attendance.')->group(function () {
            Route::get('/', [AttendanceController::class, 'index'])->name('index');
            Route::get('/create', [AttendanceController::class, 'create'])->name('create');
            Route::post('/store', [AttendanceController::class, 'store'])->name('store');
            Route::get('/show/{id?}', [AttendanceController::class, 'show'])->name('show');
            Route::get('/{attendance}/edit', [AttendanceController::class, 'edit'])->name('edit');
            Route::put('/{attendance}', [AttendanceController::class, 'update'])->name('update');
            Route::delete('/{attendance}', [AttendanceController::class, 'destroy'])->name('destroy');
            
            // Reports
            Route::get('/student/{student}/report', [AttendanceController::class, 'studentReport'])->name('student.report');
            Route::get('/classroom/{classroom}/report', [AttendanceController::class, 'classroomReport'])->name('classroom.report');
        });

        // Term Results Management
        Route::resource('term-results', TermResultController::class);
        Route::patch('term-results/{termResult}/comments', [TermResultController::class, 'updateComments'])->name('term-results.comments');
        Route::post('term-results/get-or-create', [TermResultController::class, 'getOrCreate'])->name('term-results.get-or-create');
        Route::post('term-results/bulk-create', [TermResultController::class, 'bulkCreate'])->name('term-results.bulk-create');
        Route::post('term-results/recalculate', [TermResultController::class, 'recalculate'])->name('term-results.recalculate');
        Route::post('term-results/{termResult}/generate-comments', [TermResultController::class, 'generateDefaultComments'])->name('term-results.generate-comments');
        Route::get('term-results/export', [TermResultController::class, 'export'])->name('term-results.export');
        Route::get('term-results/import', [TermResultController::class, 'importPage'])->name('term-results.import');
        Route::post('term-results/import', [TermResultController::class, 'import'])->name('term-results.import.process');
        Route::get('term-results/download-template', [TermResultController::class, 'downloadTemplate'])->name('term-results.download-template');
        // Report Cards
        Route::get('reports/student-report-card/{student}/term/{term}/classroom/{classroom}', [ReportCardController::class, 'studentReportCard'])->name('reports.student-report-card');
        Route::get('report-cards', [ReportCardController::class, 'index'])->name('report-cards.index');
            

        // Results Management - Additional Routes
        Route::prefix('results')->name('results.')->group(function () {

            Route::get('/test',[ResultController::class, 'compileIndex'])->name('tst');
            
            // Helper Routes
            Route::get('/classroom/{classroom}/students', [ResultController::class, 'getStudentsByClassroom'])->name('students-by-classroom');
            
            // Template and Bulk Operations
            Route::get('/template', [ResultController::class, 'downloadTemplate'])->name('template');
            Route::get('/bulk-create', [ResultController::class, 'bulkCreate'])->name('bulk-create');
            Route::post('/bulk-store', [ResultController::class, 'bulkStore'])->name('bulk-store');
            Route::get('/import', [ResultController::class, 'importPage'])->name('import');
            Route::post('/import', [ResultController::class, 'import'])->name('import.process');
            Route::get('/export', [ResultController::class, 'export'])->name('export');
            Route::get('/download-template', [ResultController::class, 'downloadTemplate'])->name('download-template');
            Route::post('/{result}/update-comments', [ResultController::class, 'updateComments'])->name('update-comments');
            
            // Analysis and Compilation
            Route::get('/compile', [ResultController::class, 'compileIndex'])->name('compile');
            Route::post('/compile', [ResultController::class, 'compile'])->name('compile.process');
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

        // Class Teacher specific routes
        Route::get('/results/manageable-subjects', [ResultController::class, 'getManageableSubjects'])->name('results.manageable-subjects');
        Route::get('/results/teacher-permissions', [ResultController::class, 'getTeacherPermissions'])->name('results.teacher-permissions');

        Route::resource('results', ResultController::class);
        
        Route::post('/students/import', [StudentController::class, 'import'])->name('students.import.process');
        Route::get('/students/import', [StudentController::class, 'importPage'])->name('students.import');
        Route::get('/students/export', [StudentController::class, 'export'])->name('students.export');
        Route::get('/students/template', [StudentController::class, 'downloadTemplate'])->name('students.template');

        // Settings Management
        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('/', [SettingsController::class, 'index'])->name('index');
            Route::post('/general', [SettingsController::class, 'updateGeneral'])->name('update.general');
            Route::post('/academic', [SettingsController::class, 'updateAcademic'])->name('update.academic');
            Route::post('/system', [SettingsController::class, 'updateSystem'])->name('update.system');
            Route::post('/theme', [SettingsController::class, 'updateTheme'])->name('update.theme');
            Route::post('/logo', [SettingsController::class, 'uploadLogo'])->name('upload.logo');
            Route::post('/backup', [SettingsController::class, 'backup'])->name('backup');
            Route::post('/clear-cache', [SettingsController::class, 'clearCache'])->name('clear.cache');
            Route::post('/optimize', [SettingsController::class, 'optimizeSystem'])->name('optimize');
            Route::post('/active-session', [SettingsController::class, 'setActiveSession'])->name('active.session');
            Route::post('/active-term', [SettingsController::class, 'setActiveTerm'])->name('active.term');
        });

        // CBT (Computer-Based Testing) Management
        Route::prefix('cbt')->name('cbt.')->group(function () {
            Route::resource('questions', AdminCBTQuestionController::class);
            Route::resource('exams', AdminCBTExamController::class);
            Route::post('exams/{exam}/publish', [AdminCBTExamController::class, 'publish'])->name('exams.publish');
            Route::post('exams/{exam}/unpublish', [AdminCBTExamController::class, 'unpublish'])->name('exams.unpublish');
            Route::post('exams/{exam}/clone', [AdminCBTExamController::class, 'clone'])->name('exams.clone');
            
            // Question management routes for exams
            Route::post('exams/{exam}/questions/attach', [AdminCBTExamController::class, 'attachQuestion'])->name('exams.questions.attach');
            Route::delete('exams/{exam}/questions/{question}', [AdminCBTExamController::class, 'detachQuestion'])->name('exams.questions.detach');
            Route::post('exams/{exam}/questions/reorder', [AdminCBTExamController::class, 'reorderQuestions'])->name('exams.questions.reorder');
            
            Route::resource('schedules', AdminCBTExamScheduleController::class);
            Route::post('schedules/{schedule}/start', [AdminCBTExamScheduleController::class, 'start'])->name('schedules.start');
            Route::post('schedules/{schedule}/complete', [AdminCBTExamScheduleController::class, 'complete'])->name('schedules.complete');
            Route::post('schedules/{schedule}/cancel', [AdminCBTExamScheduleController::class, 'cancel'])->name('schedules.cancel');
            Route::get('schedules/{schedule}/monitor', [AdminCBTExamScheduleController::class, 'monitor'])->name('schedules.monitor');
            
            Route::resource('timetables', AdminCBTExamTimetableController::class);
            Route::post('timetables/{timetable}/publish', [AdminCBTExamTimetableController::class, 'publish'])->name('timetables.publish');
            Route::post('timetables/{timetable}/unpublish', [AdminCBTExamTimetableController::class, 'unpublish'])->name('timetables.unpublish');
            
            // Analytics and Reports
            Route::get('analytics', [AdminCBTExamController::class, 'analytics'])->name('analytics');
            Route::get('reports/exam/{exam}', [AdminCBTExamController::class, 'examReport'])->name('reports.exam');
            Route::get('reports/schedule/{schedule}', [AdminCBTExamScheduleController::class, 'scheduleReport'])->name('reports.schedule');
        });
    });

    // Teacher routes
    Route::middleware(['auth', 'role:teacher'])->prefix('teacher')->name('teacher.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'teacherDashboard'])->name('dashboard');
        Route::get('/subjects', [SubjectController::class, 'teacherSubjects'])->name('subjects');
        Route::get('/students', [StudentController::class, 'teacherStudents'])->name('students');
        
        // Teacher Attendance Management
        Route::prefix('attendance')->name('attendance.')->group(function () {
            Route::get('/', [AttendanceController::class, 'index'])->name('index');
            Route::get('/create', [AttendanceController::class, 'create'])->name('create');
            Route::post('/store', [AttendanceController::class, 'store'])->name('store');
            Route::get('/{attendance}/edit', [AttendanceController::class, 'edit'])->name('edit');
            Route::put('/{attendance}', [AttendanceController::class, 'update'])->name('update');
        });
        
        // Results Management
        Route::prefix('results')->name('results.')->group(function () {
            Route::get('/', [TeacherResultController::class, 'index'])->name('index');
            Route::get('/create', [TeacherResultController::class, 'create'])->name('create');
            Route::post('/', [TeacherResultController::class, 'store'])->name('store');
            Route::get('/{result}/edit', [TeacherResultController::class, 'edit'])->name('edit');
            Route::put('/{result}', [TeacherResultController::class, 'update'])->name('update');
            Route::delete('/{result}', [TeacherResultController::class, 'destroy'])->name('destroy');
            Route::get('/bulk-create', [TeacherResultController::class, 'bulkCreate'])->name('bulk-create');
            Route::post('/bulk-store', [TeacherResultController::class, 'bulkStore'])->name('bulk-store');
            Route::get('/classroom/{classroom}/students', [TeacherResultController::class, 'getClassroomStudents'])->name('classroom.students');
            Route::get('/compile', [TeacherResultController::class, 'compileIndex'])->name('compile.index');
            Route::post('/compile', [TeacherResultController::class, 'compile'])->name('compile');
        });

        // CBT (Computer-Based Testing) for Teachers
        Route::prefix('cbt')->name('cbt.')->group(function () {
            Route::resource('questions', TeacherCBTQuestionController::class);
            Route::get('questions/import', [TeacherCBTQuestionController::class, 'importPage'])->name('questions.import');
            Route::post('questions/import', [TeacherCBTQuestionController::class, 'import'])->name('questions.import.process');
            Route::get('questions/template', [TeacherCBTQuestionController::class, 'downloadTemplate'])->name('questions.template');
            
            Route::resource('exams', TeacherCBTExamController::class);
            Route::post('exams/{exam}/publish', [TeacherCBTExamController::class, 'publish'])->name('exams.publish');
            Route::post('exams/{exam}/unpublish', [TeacherCBTExamController::class, 'unpublish'])->name('exams.unpublish');
            Route::post('exams/{exam}/clone', [TeacherCBTExamController::class, 'clone'])->name('exams.clone');
            Route::get('exams/{exam}/analytics', [TeacherCBTExamController::class, 'analytics'])->name('exams.analytics');
            Route::get('exams/{exam}/results', [TeacherCBTExamController::class, 'results'])->name('exams.results');
        });
    });

        // Notification routes (shared by all authenticated users)
    Route::middleware(['auth'])->group(function () {
        // API endpoints for real-time updates
        Route::get('/api/notifications/unread-count', [NotificationController::class, 'getUnreadCount'])->name('api.notifications.unread-count');
        Route::get('/api/notifications/unread', [NotificationController::class, 'getUnreadNotifications'])->name('api.notifications.unread');
        Route::get('/api/messages/unread-count', [MessageController::class, 'getUnreadCount'])->name('api.messages.unread-count');

        Route::prefix('notifications')->name('notifications.')->group(function () {
            Route::get('/', [NotificationController::class, 'index'])->name('index');
            Route::get('/create', [NotificationController::class, 'create'])->name('create');
            Route::post('/', [NotificationController::class, 'store'])->name('store');
            Route::get('/{notification}', [NotificationController::class, 'show'])->name('show');
            Route::patch('/{notification}/read', [NotificationController::class, 'markAsRead'])->name('read');
            Route::patch('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
            Route::delete('/{notification}', [NotificationController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('messages')->name('messages.')->group(function () {
            Route::get('/inbox', [MessageController::class, 'inbox'])->name('inbox');
            Route::get('/sent', [MessageController::class, 'sent'])->name('sent');
            Route::get('/create', [MessageController::class, 'create'])->name('create');
            Route::post('/', [MessageController::class, 'store'])->name('store');
            Route::get('/{message}', [MessageController::class, 'show'])->name('show');
            Route::patch('/{message}/read', [MessageController::class, 'markAsRead'])->name('read');
            Route::delete('/{message}', [MessageController::class, 'destroy'])->name('destroy');
            Route::get('/{message}/download/{attachment}', [MessageController::class, 'downloadAttachment'])->name('download');
        });

        // API endpoints for real-time updates
        Route::get('/api/notifications/unread-count', [NotificationController::class, 'getUnreadCount'])->name('api.notifications.unread-count');
        Route::get('/api/messages/unread-count', [MessageController::class, 'getUnreadCount'])->name('api.messages.unread-count');
    });

    // Student routes
    Route::middleware(['auth', 'role:student'])->prefix('student')->name('student.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'studentDashboard'])->name('dashboard');
        
        // Results viewing
        Route::prefix('results')->name('results.')->group(function () {
            Route::get('/', [StudentResultController::class, 'index'])->name('index');
            Route::get('/term/{term}', [StudentResultController::class, 'showTerm'])->name('term');
            Route::get('/term/{term}/report-card', [StudentResultController::class, 'downloadReportCard'])->name('report-card');
            Route::get('/progress', [StudentResultController::class, 'progress'])->name('progress');
        });

        // CBT (Computer-Based Testing) for Students
        Route::prefix('cbt')->name('cbt.')->group(function () {
            Route::get('/', [StudentCBTExamController::class, 'index'])->name('index');
            Route::get('/timetable', [StudentCBTExamController::class, 'timetable'])->name('timetable');
            Route::get('/exam/{exam}', [StudentCBTExamController::class, 'show'])->name('exam.show');
            Route::get('/exam/{exam}/results', [StudentCBTExamController::class, 'examResults'])->name('exam.results.by-exam');
            Route::post('/exam/{exam}/start', [StudentCBTExamController::class, 'start'])->name('exam.start');
            Route::get('/exam/{exam}/take', [StudentCBTExamController::class, 'take'])->name('exam.take');
            Route::post('/exam/{attempt}/answer', [StudentCBTExamController::class, 'submitAnswer'])->name('exam.answer');
            Route::post('/exam/{attempt}/flag', [StudentCBTExamController::class, 'flagQuestion'])->name('exam.flag');
            Route::post('/exam/{attempt}/submit', [StudentCBTExamController::class, 'submit'])->name('exam.submit');
            Route::get('/exam/{attempt}/results', [StudentCBTExamController::class, 'results'])->name('exam.results');
            Route::get('/results', [StudentCBTResultController::class, 'index'])->name('results.index');
            Route::get('/results/{attempt}', [StudentCBTResultController::class, 'show'])->name('results.show');
            Route::get('/report-card', [StudentCBTResultController::class, 'reportCard'])->name('results.report-card');
        });
    });
});

require __DIR__.'/auth.php';
