<!DOCTYPE html>
<html>
<head>
    <title>Academic Report Card - {{ $student->user->name }}</title>
    <meta charset="utf-8">
    <style>
        @page {
            margin: 15mm;
            size: A4 portrait;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            line-height: 1.2;
            color: #333;
            font-size: 9px;
            background: white;
            margin: 0;
            padding: 15mm;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
        }
        
        .report-container {
            width: 100%;
            max-width: 180mm;
            padding: 0;
            margin: 0 auto;
        }
        
        /* Professional Header with Logo */
        .header {
            background: linear-gradient(135deg, {{ $app_settings['school_primary_color'] ?? '#1e40af' }} 0%, {{ $app_settings['school_secondary_color'] ?? '#3b82f6' }} 100%);
            color: white;
            padding: 15px;
            text-align: center;
            margin-bottom: 10px;
            border-radius: 6px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
        }
        
        .school-logo {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: bold;
            flex-shrink: 0;
        }
        
        .header-content {
            text-align: center;
            flex: 1;
        }
        
        .school-name {
            font-size: 20px;
            font-weight: 900;
            margin-bottom: 3px;
            letter-spacing: 0.8px;
            color: #ffffff;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }
        
        .school-details {
            font-size: 9px;
            font-weight: 600;
            margin-bottom: 8px;
            line-height: 1.4;
            color: #ffffff;
            text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.2);
        }
        
        .report-title {
            font-size: 16px;
            font-weight: 800;
            margin-bottom: 3px;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: #ffffff;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }
        
        .session-info {
            font-size: 12px;
            font-weight: 700;
            color: #ffffff;
            text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.2);
        }

        /* Watermark */
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            color: rgba(0,0,0,0.05);
            font-weight: bold;
            pointer-events: none;
            z-index: -1;
            user-select: none;
        }
        
        /* Compact Student Info */
        .student-info {
            background: #f8fafc;
            padding: 8px;
            border-radius: 4px;
            margin-bottom: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 5px;
            font-size: 8px;
        }
        
        .info-item {
            display: flex;
            align-items: center;
        }
        
        .info-label {
            font-weight: 600;
            color: #4a5568;
            min-width: 60px;
            font-size: 7px;
        }
        
        .info-value {
            font-weight: 500;
            color: #2d3748;
            font-size: 8px;
        }
        
        /* Compact Statistics Grid */
        .statistics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 5px;
            margin-bottom: 10px;
        }
        
        .stat-box {
            text-align: center;
            background: white;
            padding: 6px;
            border-radius: 4px;
            border: 1px solid #e2e8f0;
        }
        
        .stat-value {
            font-size: 14px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 1px;
        }
        
        .stat-label {
            font-size: 7px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 500;
        }
        
        /* Compact Results Table */
        .results-section {
            margin-bottom: 8px;
        }
        
        .section-title {
            font-size: 10px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 5px;
            padding-bottom: 2px;
            border-bottom: 2px solid #3b82f6;
        }
        
        .results-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8px;
            margin-bottom: 6px;
        }
        
        .results-table th {
            background: #1e40af;
            color: white;
            padding: 4px 2px;
            text-align: center;
            font-weight: 600;
            font-size: 7px;
        }
        
        .results-table td {
            padding: 3px 2px;
            text-align: center;
            border: 1px solid #e2e8f0;
            font-size: 8px;
        }
        
        .results-table tbody tr:nth-child(even) {
            background: #f8fafc;
        }
        
        .subject-name {
            text-align: left !important;
            font-weight: 500;
            color: #2d3748;
        }
        
        .grade-cell {
            font-weight: bold;
            font-size: 9px;
        }
        
        .grade-A { color: #22c55e; }
        .grade-B { color: #3b82f6; }
        .grade-C { color: #f59e0b; }
        .grade-D { color: #ef4444; }
        .grade-F { color: #dc2626; }
        
        /* Compact Performance Section */
        .performance-section {
            margin-bottom: 6px;
            flex: 1;
            background: #f8fafc;
            padding: 4px;
            border-radius: 4px;
        }
        
        .performance-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4px;
            margin-bottom: 6px;
        }
        
        .performance-item {
            text-align: center;
            background: #f8fafc;
            padding: 4px;
            border-radius: 3px;
        }
        
        .performance-value {
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 1px;
        }
        
        .performance-label {
            font-size: 6px;
            color: #64748b;
        }

        /* Row Container for side-by-side layout */
        .row-layout {
            display: flex;
            gap: 8px;
            margin-bottom: 6px;
        }

        /* Compact Grading Scale */
        .grading-scale {
            background: #f8fafc;
            padding: 4px;
            border-radius: 4px;
            margin-bottom: 6px;
            flex: 1;
        }
            flex: 1;
        }        .scale-title {
            font-size: 8px;
            font-weight: 600;
            margin-bottom: 3px;
            color: #1e40af;
        }
        
        .scale-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 3px;
            font-size: 6px;
        }
        
        .scale-item {
            text-align: center;
            padding: 2px;
            background: white;
            border-radius: 2px;
        }
        
        .scale-grade {
            font-weight: bold;
            color: #1e40af;
        }
        
        /* Compact Comments */
        .comments-section {
            margin-bottom: 8px;
        }
        
        .comment-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
        }
        
        .comment-box {
            background: #f8fafc;
            padding: 5px;
            border-radius: 3px;
            border-left: 2px solid #3b82f6;
        }
        
        .comment-title {
            font-size: 7px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 2px;
        }
        
        .comment-text {
            font-size: 7px;
            color: #4a5568;
            line-height: 1.2;
        }
        
        /* Compact Footer */
        .footer {
            border-top: 1px solid #e2e8f0;
            padding-top: 5px;
        }
        
        .signatures {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 5px;
        }
        
        .signature-box {
            text-align: center;
        }
        
        .signature-title {
            font-size: 6px;
            color: #64748b;
            margin-bottom: 15px;
        }
        
        .signature-line {
            border-bottom: 1px solid #cbd5e0;
            height: 15px;
        }
        
        .generated-info {
            text-align: center;
            font-size: 6px;
            color: #9ca3af;
            margin-top: 5px;
        }
        
        /* Print optimizations */
        @media print {
            body { 
                font-size: 8px; 
                -webkit-print-color-adjust: exact;
                margin: 0;
                padding: 20px;
            }
            .report-container { 
                padding: 0; 
                margin: 0 auto;
                page-break-inside: avoid;
                max-width: 170mm;
            }
            .header { 
                padding: 8px; 
                margin-bottom: 6px;
            }
            .stat-value { font-size: 12px; }
            .section-title { font-size: 9px; }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <!-- Professional Header with Logo -->
        <div class="header">
            <!-- School Logo -->
            <div class="school-logo">
                @if(isset($app_settings['school_logo']) && !empty($app_settings['school_logo']))
                    <img src="{{ public_path('storage/' . $app_settings['school_logo']) }}" alt="School Logo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                @else
                    <span style="font-size: 16px;">🎓</span>
                @endif
            </div>
            
            <!-- Header Content -->
            <div class="header-content">
                <div class="school-name">Excellence Academy</div>
                <div class="school-details">
                    TESTINGINF
                    <br>Tel: 0903289809398 | Email: EXAMPLE@GMAIL.COM
                    <br><em>"Excellence in Education"</em>
                </div>
                <div class="report-title">Student Report Card</div>
                <div class="session-info">{{ $academic_session->name }} - {{ $term->name }}</div>
            </div>
        </div>

        <!-- Logo Watermark -->
        <div class="watermark">
            @if(isset($app_settings['school_logo']) && !empty($app_settings['school_logo']))
                <img src="{{ public_path('storage/' . $app_settings['school_logo']) }}" alt="Watermark" style="width: 150px; height: 150px; opacity: 0.03; object-fit: contain;">
            @else
                🎓
            @endif
        </div>

        <!-- Professional Student Info Table (2 Columns) -->
        <div style="margin-bottom: 10px;">
            <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border-radius: 4px;">
                <tr>
                    <td style="padding: 6px; border: 1px solid #e2e8f0; background: white; width: 33.33%;">
                        <div style="color: #4a5568; font-weight: 600; font-size: 7px; margin-bottom: 1px;">Student:</div>
                        <div style="color: #2d3748; font-weight: 500; font-size: 8px;">{{ $student->user->name }}</div>
                    </td>
                    <td style="padding: 6px; border: 1px solid #e2e8f0; background: white; width: 33.33%;">
                        <div style="color: #4a5568; font-weight: 600; font-size: 7px; margin-bottom: 1px;">Admission:</div>
                        <div style="color: #2d3748; font-weight: 500; font-size: 8px;">{{ $student->admission_number }}</div>
                    </td>
                    <td style="padding: 6px; border: 1px solid #e2e8f0; background: white; width: 33.33%;">
                        <div style="color: #4a5568; font-weight: 600; font-size: 7px; margin-bottom: 1px;">Class:</div>
                        <div style="color: #2d3748; font-weight: 500; font-size: 8px;">{{ $student->classroom->name }}</div>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 6px; border: 1px solid #e2e8f0; background: white;">
                        <div style="color: #4a5568; font-weight: 600; font-size: 7px; margin-bottom: 1px;">Gender:</div>
                        <div style="color: #2d3748; font-weight: 500; font-size: 8px;">{{ ucfirst($student->gender ?? 'N/A') }}</div>
                    </td>
                    <td style="padding: 6px; border: 1px solid #e2e8f0; background: white;">
                        <div style="color: #4a5568; font-weight: 600; font-size: 7px; margin-bottom: 1px;">DOB:</div>
                        <div style="color: #2d3748; font-weight: 500; font-size: 8px;">{{ $student->date_of_birth ? date('d/m/Y', strtotime($student->date_of_birth)) : 'N/A' }}</div>
                    </td>
                    <td style="padding: 6px; border: 1px solid #e2e8f0; background: white;">
                        <div style="color: #4a5568; font-weight: 600; font-size: 7px; margin-bottom: 1px;">Position:</div>
                        <div style="color: #2d3748; font-weight: 500; font-size: 8px;">{{ $statistics['position'] }} of {{ $statistics['total_students'] }}</div>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Compact Statistics Table -->
        <div style="margin-bottom: 10px;">
            <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border-radius: 4px;">
                <tr>
                    <td style="text-align: center; padding: 6px; border: 1px solid #e2e8f0; background: white;">
                        <div style="color: #3b82f6; font-size: 14px; font-weight: bold; margin-bottom: 1px;">{{ $statistics['total_subjects'] }}</div>
                        <div style="color: #64748b; font-size: 7px; text-transform: uppercase; font-weight: 500;">Subjects</div>
                    </td>
                    <td style="text-align: center; padding: 6px; border: 1px solid #e2e8f0; background: white;">
                        <div style="color: #3b82f6; font-size: 14px; font-weight: bold; margin-bottom: 1px;">{{ $statistics['average_score'] }}%</div>
                        <div style="color: #64748b; font-size: 7px; text-transform: uppercase; font-weight: 500;">Average</div>
                    </td>
                    <td style="text-align: center; padding: 6px; border: 1px solid #e2e8f0; background: white;">
                        <div style="color: #3b82f6; font-size: 14px; font-weight: bold; margin-bottom: 1px;">{{ $statistics['gpa'] }}</div>
                        <div style="color: #64748b; font-size: 7px; text-transform: uppercase; font-weight: 500;">GPA</div>
                    </td>
                    <td style="text-align: center; padding: 6px; border: 1px solid #e2e8f0; background: white;">
                        <div style="color: #3b82f6; font-size: 14px; font-weight: bold; margin-bottom: 1px;">{{ $attendance['attendance_percentage'] }}%</div>
                        <div style="color: #64748b; font-size: 7px; text-transform: uppercase; font-weight: 500;">Attendance</div>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Compact Academic Results -->
        <div class="results-section">
            <div class="section-title">Academic Performance</div>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>CA</th>
                        <th>Exam</th>
                        <th>Total</th>
                        <th>Grade</th>
                        <th>Pos</th>
                        <th>Remark</th>
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
                        <td colspan="3">Avg: {{ $statistics['average_score'] }}%</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Performance Analysis and Grading Scale Row -->
        <div class="row-layout">
            <!-- Compact Performance Analysis -->
            <div class="performance-section">
                <div class="section-title">Class Comparison</div>
                <table style="width: 100%; font-size: 8px; border-collapse: collapse;">
                    <tr>
                        <td style="text-align: center; padding: 3px; background: white; border: 1px solid #e2e8f0;">
                            <div style="color: #3b82f6; font-weight: bold; font-size: 12px;">{{ $statistics['average_score'] }}%</div>
                            <div style="color: #64748b; font-size: 6px;">Your Average</div>
                        </td>
                        <td style="text-align: center; padding: 3px; background: white; border: 1px solid #e2e8f0;">
                            <div style="color: #64748b; font-weight: bold; font-size: 12px;">{{ $class_statistics['class_average'] }}%</div>
                            <div style="color: #64748b; font-size: 6px;">Class Average</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center; padding: 3px; background: white; border: 1px solid #e2e8f0;">
                            <div style="color: #22c55e; font-weight: bold; font-size: 12px;">{{ $class_statistics['highest_average'] }}%</div>
                            <div style="color: #64748b; font-size: 6px;">Highest</div>
                        </td>
                        <td style="text-align: center; padding: 3px; background: white; border: 1px solid #e2e8f0;">
                            <div style="color: #f59e0b; font-weight: bold; font-size: 12px;">{{ $statistics['position'] }}/{{ $statistics['total_students'] }}</div>
                            <div style="color: #64748b; font-size: 6px;">Position</div>
                        </td>
                    </tr>
                </table>
            </div>
            
            <!-- Compact Grading Scale -->
            <div class="grading-scale">
                <div class="scale-title">Grading Scale</div>
                <table style="width: 100%; font-size: 7px; border-collapse: collapse;">
                    @php $chunks = array_chunk($grading_scale, 4) @endphp
                    @foreach($chunks as $chunk)
                    <tr>
                        @foreach($chunk as $scale)
                        <td style="text-align: center; padding: 2px; background: white; border: 1px solid #e2e8f0;">
                            <div style="font-weight: bold; color: #1e40af;">{{ $scale['grade'] }}</div>
                            <div style="font-size: 5px;">{{ $scale['range'] }}</div>
                        </td>
                        @endforeach
                        @if(count($chunk) < 4)
                            @for($i = count($chunk); $i < 4; $i++)
                            <td style="padding: 2px; border: 1px solid #e2e8f0;"></td>
                            @endfor
                        @endif
                    </tr>
                    @endforeach
                </table>
            </div>
        </div>

        <!-- Compact Comments -->
        <div class="comments-section">
            <div class="section-title">Comments & Remarks</div>
            <div class="comment-grid">
                <div class="comment-box">
                    <div class="comment-title">Teacher's Comment</div>
                    <div class="comment-text">{{ $comments['class_teacher'] }}</div>
                </div>
                <div class="comment-box">
                    <div class="comment-title">Principal's Comment</div>
                    <div class="comment-text">{{ $comments['principal'] }}</div>
                </div>
            </div>
        </div>

        <!-- Compact Footer -->
        <div class="footer">
            <div class="signatures">
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <div class="signature-title">Class Teacher</div>
                </div>
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <div class="signature-title">Principal</div>
                </div>
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <div class="signature-title">Parent/Guardian</div>
                </div>
            </div>
            <div class="generated-info">
                Generated: {{ $generated_on }} | Excellence Academy SMS
            </div>
        </div>
    </div>
</body>
</html>
