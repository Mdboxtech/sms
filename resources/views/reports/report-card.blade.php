<!DOCTYPE html>
<html>
<head>
    <title>Student Report Card</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.4;
            color: #1a1a1a;
            background: #f8fafc;
            padding: 15px;
            font-size: 12px;
        }
        
        .report-container {
            max-width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
        }
        
        .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        .school-name {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 5px;
            letter-spacing: 0.5px;
        }
        
        .report-title {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 8px;
        }
        
        .academic-session {
            font-size: 14px;
            opacity: 0.95;
        }
        
        .content {
            padding: 20px;
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .student-info {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .student-grid {
            width: 100%;
        }
        
        .student-row {
            display: table;
            width: 100%;
            margin-bottom: 8px;
        }
        
        .student-row .info-item {
            display: table-cell;
            width: 25%;
            vertical-align: top;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
        }
        
        .info-label {
            font-size: 10px;
            font-weight: 600;
            color: #1e40af;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 3px;
        }
        
        .info-value {
            font-size: 13px;
            font-weight: 500;
            color: #1e293b;
            padding: 2px 0;
            border-bottom: 1px solid #cbd5e1;
        }
        
        .results-section {
            flex: 1;
        }
        
        .section-title {
            color: #1e40af;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid #bfdbfe;
        }
        
        .results-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border: 1px solid #bfdbfe;
            border-radius: 6px;
            overflow: hidden;
            margin-bottom: 20px;
        }
        
        .results-table th {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            font-weight: 600;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            padding: 10px 6px;
            text-align: center;
            border-right: 1px solid rgba(255,255,255,0.2);
        }
        
        .results-table th:last-child {
            border-right: none;
        }
        
        .results-table td {
            padding: 8px 6px;
            border-bottom: 1px solid #f1f5f9;
            border-right: 1px solid #f1f5f9;
            font-size: 11px;
            text-align: center;
        }
        
        .results-table td:first-child {
            text-align: left;
            font-weight: 500;
            background: #f8fafc;
        }
        
        .results-table td:last-child {
            border-right: none;
        }
        
        .results-table tbody tr:last-child td {
            border-bottom: none;
        }
        
        .grade-a { color: #16a34a; font-weight: 600; }
        .grade-b { color: #2563eb; font-weight: 600; }
        .grade-c { color: #d97706; font-weight: 600; }
        .grade-d { color: #dc2626; font-weight: 600; }
        .grade-f { color: #dc2626; font-weight: 600; }
        
        .summary {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border: 1px solid #bfdbfe;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .summary-grid {
            width: 100%;
        }
        
        .summary-row {
            display: table;
            width: 100%;
        }
        
        .summary-item {
            display: table-cell;
            width: 33.33%;
            text-align: center;
            background: white;
            padding: 12px;
            border-radius: 4px;
            border: 1px solid #cbd5e1;
            vertical-align: top;
        }
        
        .summary-label {
            font-size: 10px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        
        .summary-value {
            font-size: 18px;
            font-weight: 700;
            color: #1e40af;
        }
        
        .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: auto;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
        
        .comments-section {
            margin-bottom: 30px;
        }

        .comment-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 15px;
        }

        .comment-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
        }

        .comment-label {
            font-size: 11px;
            font-weight: 600;
            color: #1e40af;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .comment-content {
            font-size: 13px;
            color: #1e293b;
            line-height: 1.5;
            min-height: 40px;
        }

        .signatures {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 20px;
        }

        .signature-item {
            text-align: center;
        }

        .signature-line {
            width: 100%;
            height: 1px;
            background: #1e40af;
            margin-bottom: 5px;
        }

        .signature-label {
            font-size: 11px;
            font-weight: 600;
            color: #64748b;
            margin-bottom: 5px;
        }

        .signature-date {
            font-size: 10px;
            color: #64748b;
        }

        .report-date {
            font-size: 11px;
            color: #64748b;
            text-align: center;
        }

        @media print {
            body {
                padding: 0;
                background: white;
            }
            .report-container {
                box-shadow: none;
                max-width: none;
                min-height: auto;
            }
        }
        
        @page {
            margin: 0.5in;
            size: A4;
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <div class="school-name">School Management System</div>
            <div class="report-title">Official Academic Report Card</div>
            <div class="academic-session">{{ $term->academicSession->name }} - {{ $term->name }}</div>
        </div>

        <div class="content">
            <div class="student-info">
                <div class="student-grid">
                    <div class="student-row">
                        <div class="info-item">
                            <div class="info-label">Student Name</div>
                            <div class="info-value">{{ $student->user->name }}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Class</div>
                            <div class="info-value">{{ $student->classroom->name }} {{ $student->classroom->section ?? '' }}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Admission Number</div>
                            <div class="info-value">{{ $student->admission_number }}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Class Position</div>
                            <div class="info-value">{{ $position }} of {{ $student->classroom->students()->count() }}</div>
                        </div>
                    </div>
                </div>
            </div>

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
                            <td>{{ $result->subject->name }}</td>
                            <td>{{ $result->ca_score }}</td>
                            <td>{{ $result->exam_score }}</td>
                            <td><strong>{{ $result->total_score }}</strong></td>
                            <td>
                                @if($result->total_score >= 70) 
                                    <span class="grade-a">A</span>
                                @elseif($result->total_score >= 60) 
                                    <span class="grade-b">B</span>
                                @elseif($result->total_score >= 50) 
                                    <span class="grade-c">C</span>
                                @elseif($result->total_score >= 40) 
                                    <span class="grade-d">D</span>
                                @else 
                                    <span class="grade-f">F</span>
                                @endif
                            </td>
                            <td>{{ $result->position }}</td>
                            <td>
                                @if($result->total_score >= 70)
                                    <span class="grade-a">Excellent</span>
                                @elseif($result->total_score >= 60)
                                    <span class="grade-b">Very Good</span>
                                @elseif($result->total_score >= 50)
                                    <span class="grade-c">Good</span>
                                @elseif($result->total_score >= 40)
                                    <span class="grade-d">Fair</span>
                                @else
                                    <span class="grade-f">Poor</span>
                                @endif
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            <div class="summary">
                <div class="summary-grid">
                    <div class="summary-row">
                        <div class="summary-item">
                            <div class="summary-label">Total Score</div>
                            <div class="summary-value">{{ $total_score }}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Student Average</div>
                            <div class="summary-value">{{ number_format($average_score, 1) }}%</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Class Average</div>
                            <div class="summary-value">{{ number_format($class_average, 1) }}%</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="comments-section">
                <div class="section-title">Comments & Recommendations</div>
                <div class="comment-grid">
                    <div class="comment-box">
                        <div class="comment-label">Teacher's Comment</div>
                        <div class="comment-content">{{ $teacher_comment }}</div>
                    </div>
                    <div class="comment-box">
                        <div class="comment-label">Principal's Comment</div>
                        <div class="comment-content">{{ $principal_comment }}</div>
                    </div>
                </div>
            </div>

            <div class="footer">
                <div class="signatures">
                    <div class="signature-item">
                        <div class="signature-line"></div>
                        <div class="signature-label">Class Teacher's Signature</div>
                        <div class="signature-date">Date: ________________</div>
                    </div>
                    <div class="signature-item">
                        <div class="signature-line"></div>
                        <div class="signature-label">Principal's Signature</div>
                        <div class="signature-date">Date: ________________</div>
                    </div>
                    <div class="signature-item">
                        <div class="signature-line"></div>
                        <div class="signature-label">Parent's Signature</div>
                        <div class="signature-date">Date: ________________</div>
                    </div>
                </div>
                <div class="report-date">
                    Report Generated: {{ date('F j, Y') }}
                </div>
            </div>
        </div>
    </div>
</body>
</html>