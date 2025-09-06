<!DOCTYPE html>
<html>
<head>
    <title>Academic Report Card - {{ $student->user->name }}</title>
    <meta charset="utf-8">
    <style>
        @page {
            margin: 20px;
            size: A4;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            line-height: 1.4;
            color: #2d3748;
            font-size: 12px;
            background: white;
        }
        
        .report-container {
            width: 100%;
            min-height: 100vh;
            padding: 0;
        }
        
        /* Header Section */
        .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 25px 20px;
            text-align: center;
            margin-bottom: 20px;
            border-radius: 8px;
        }
        
        .school-logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 10px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
        }
        
        .school-name {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 5px;
            letter-spacing: 1px;
        }
        
        .school-address {
            font-size: 11px;
            opacity: 0.9;
            margin-bottom: 8px;
        }
        
        .report-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .session-info {
            font-size: 13px;
            font-weight: 500;
        }
        
        /* Student Info Section */
        .student-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #e2e8f0;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .info-item {
            display: flex;
            align-items: center;
        }
        
        .info-label {
            font-weight: 600;
            color: #4a5568;
            min-width: 120px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-value {
            font-weight: 500;
            color: #1a202c;
            font-size: 12px;
        }
        
        /* Results Table */
        .results-section {
            margin-bottom: 25px;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #3b82f6;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .results-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        
        .results-table th {
            background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
            color: white;
            padding: 12px 8px;
            text-align: center;
            font-weight: 600;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .results-table td {
            padding: 10px 8px;
            text-align: center;
            border-bottom: 1px solid #e2e8f0;
            font-size: 11px;
        }
        
        .results-table tbody tr:nth-child(even) {
            background: #f8fafc;
        }
        
        .results-table tbody tr:hover {
            background: #edf2f7;
        }
        
        .subject-name {
            text-align: left !important;
            font-weight: 600;
            color: #2d3748;
        }
        
        .grade-cell {
            font-weight: 700;
            padding: 6px !important;
        }
        
        .grade-A { background: #c6f6d5 !important; color: #22543d; }
        .grade-B { background: #bee3f8 !important; color: #2a4365; }
        .grade-C { background: #fef5e7 !important; color: #744210; }
        .grade-D { background: #fed7d7 !important; color: #742a2a; }
        .grade-F { background: #feb2b2 !important; color: #742a2a; }
        
        /* Statistics Section */
        .statistics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin: 20px 0;
        }
        
        .stat-box {
            background: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 2px solid #e2e8f0;
            transition: all 0.3s ease;
        }
        
        .stat-value {
            font-size: 20px;
            font-weight: 700;
            color: #3b82f6;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
        }
        
        /* Performance Analysis */
        .performance-section {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }
        
        .performance-chart {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .grading-scale {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .scale-title {
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 10px;
            font-size: 12px;
            text-transform: uppercase;
        }
        
        .scale-item {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            font-size: 10px;
            border-bottom: 1px solid #f1f5f9;
        }
        
        .scale-grade {
            font-weight: 600;
            color: #3b82f6;
        }
        
        /* Comments Section */
        .comments-section {
            margin: 25px 0;
        }
        
        .comment-box {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            border-left: 4px solid #3b82f6;
        }
        
        .comment-title {
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 8px;
            font-size: 11px;
            text-transform: uppercase;
        }
        
        .comment-text {
            color: #4a5568;
            font-style: italic;
            line-height: 1.5;
            font-size: 11px;
        }
        
        /* Footer Section */
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
        }
        
        .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 30px;
            text-align: center;
            margin-top: 40px;
        }
        
        .signature-box {
            border-top: 1px solid #4a5568;
            padding-top: 5px;
        }
        
        .signature-title {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        
        .generated-info {
            text-align: center;
            margin-top: 20px;
            font-size: 9px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
        }
        
        /* Watermark */
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            color: rgba(59, 130, 246, 0.05);
            font-weight: 900;
            z-index: -1;
            pointer-events: none;
        }
    </style>
</head>
<body>
    <div class="watermark">OFFICIAL</div>
    
    <div class="report-container">
        <!-- Header -->
        <div class="header">
            <div class="school-logo">SMS</div>
            <div class="school-name">School Management System</div>
            <div class="school-address">Excellence in Education | Nurturing Future Leaders</div>
            <div class="report-title">Academic Report Card</div>
            <div class="session-info">{{ $academic_session->name }} - {{ $term->name }}</div>
        </div>

        <!-- Student Information -->
        <div class="student-info">
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Student Name:</span>
                    <span class="info-value">{{ $student->user->name }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Admission No:</span>
                    <span class="info-value">{{ $student->admission_number }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Class:</span>
                    <span class="info-value">{{ $student->classroom->name }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Gender:</span>
                    <span class="info-value">{{ ucfirst($student->gender ?? 'N/A') }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Date of Birth:</span>
                    <span class="info-value">{{ $student->date_of_birth ? date('d/m/Y', strtotime($student->date_of_birth)) : 'N/A' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Position:</span>
                    <span class="info-value">{{ $statistics['position'] }} of {{ $statistics['total_students'] }}</span>
                </div>
            </div>
        </div>

        <!-- Academic Performance Statistics -->
        <div class="statistics-grid">
            <div class="stat-box">
                <div class="stat-value">{{ $statistics['total_subjects'] }}</div>
                <div class="stat-label">Total Subjects</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{{ $statistics['average_score'] }}%</div>
                <div class="stat-label">Average Score</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{{ $statistics['gpa'] }}</div>
                <div class="stat-label">GPA</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{{ $attendance['attendance_percentage'] }}%</div>
                <div class="stat-label">Attendance</div>
            </div>
        </div>

        <!-- Academic Results -->
        <div class="results-section">
            <div class="section-title">Academic Performance</div>
            <table class="results-table">
                <thead>
                    <tr>
                        <th style="width: 25%;">Subject</th>
                        <th style="width: 12%;">CA Score<br>(40)</th>
                        <th style="width: 12%;">Exam Score<br>(60)</th>
                        <th style="width: 12%;">Total<br>(100)</th>
                        <th style="width: 10%;">Grade</th>
                        <th style="width: 10%;">Position</th>
                        <th style="width: 19%;">Remark</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($results as $result)
                    <tr>
                        <td class="subject-name">{{ $result->subject->name }}</td>
                        <td>{{ $result->ca_score }}</td>
                        <td>{{ $result->exam_score }}</td>
                        <td style="font-weight: bold;">{{ $result->total_score }}</td>
                        <td class="grade-cell grade-{{ substr($result->grade_info['grade'], 0, 1) }}">
                            {{ $result->grade_info['grade'] }}
                        </td>
                        <td>{{ $result->position ?? '-' }}</td>
                        <td>{{ $result->grade_info['remark'] }}</td>
                    </tr>
                    @endforeach
                </tbody>
                <tfoot>
                    <tr style="background: #f1f5f9; font-weight: bold;">
                        <td>TOTAL</td>
                        <td>{{ $results->sum('ca_score') }}</td>
                        <td>{{ $results->sum('exam_score') }}</td>
                        <td>{{ $statistics['total_score'] }}</td>
                        <td colspan="3">Average: {{ $statistics['average_score'] }}%</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Performance Analysis -->
        <div class="performance-section">
            <div class="performance-chart">
                <div class="section-title" style="margin-bottom: 10px; font-size: 14px;">Class Comparison</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <div style="font-size: 11px; color: #64748b; margin-bottom: 5px;">Your Average</div>
                        <div style="font-size: 18px; font-weight: bold; color: #3b82f6;">{{ $statistics['average_score'] }}%</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: #64748b; margin-bottom: 5px;">Class Average</div>
                        <div style="font-size: 18px; font-weight: bold; color: #64748b;">{{ $class_statistics['class_average'] }}%</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: #64748b; margin-bottom: 5px;">Highest in Class</div>
                        <div style="font-size: 16px; font-weight: bold; color: #22c55e;">{{ $class_statistics['highest_average'] }}%</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: #64748b; margin-bottom: 5px;">Your Position</div>
                        <div style="font-size: 16px; font-weight: bold; color: #f59e0b;">{{ $statistics['position'] }}/{{ $statistics['total_students'] }}</div>
                    </div>
                </div>
            </div>
            
            <div class="grading-scale">
                <div class="scale-title">Grading Scale</div>
                @foreach($grading_scale as $scale)
                <div class="scale-item">
                    <span class="scale-grade">{{ $scale['grade'] }}</span>
                    <span>{{ $scale['range'] }}</span>
                    <span style="font-size: 9px; color: #64748b;">{{ $scale['remark'] }}</span>
                </div>
                @endforeach
            </div>
        </div>

        <!-- Attendance Record -->
        <div class="results-section">
            <div class="section-title">Attendance Record</div>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
                <div style="text-align: center;">
                    <div style="font-size: 18px; font-weight: bold; color: #22c55e;">{{ $attendance['days_present'] }}</div>
                    <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Days Present</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 18px; font-weight: bold; color: #ef4444;">{{ $attendance['days_absent'] }}</div>
                    <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Days Absent</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 18px; font-weight: bold; color: #3b82f6;">{{ $attendance['total_days'] }}</div>
                    <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Total Days</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 18px; font-weight: bold; color: #8b5cf6;">{{ $attendance['attendance_percentage'] }}%</div>
                    <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Attendance Rate</div>
                </div>
            </div>
        </div>

        <!-- Comments Section -->
        <div class="comments-section">
            <div class="section-title">Comments & Remarks</div>
            
            <div class="comment-box">
                <div class="comment-title">Class Teacher's Comment</div>
                <div class="comment-text">{{ $comments['class_teacher'] }}</div>
            </div>
            
            <div class="comment-box">
                <div class="comment-title">Principal's Comment</div>
                <div class="comment-text">{{ $comments['principal'] }}</div>
            </div>
        </div>

        <!-- Footer with Signatures -->
        <div class="footer">
            <div class="signatures">
                <div class="signature-box">
                    <div class="signature-title">Class Teacher</div>
                </div>
                <div class="signature-box">
                    <div class="signature-title">Principal</div>
                </div>
                <div class="signature-box">
                    <div class="signature-title">Parent/Guardian</div>
                </div>
            </div>
            
            <div class="generated-info">
                Report generated on {{ $generated_on }} | This is an official document from School Management System
            </div>
        </div>
    </div>
</body>
</html>
