<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Receipt - {{ $payment->receipt_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            background: white;
            color: #333;
            line-height: 1.4;
            font-size: 12px;
        }
        
        /* A4 Page Settings */
        .receipt-container {
            width: 190mm;
            margin: 10mm auto;
            background: white;
            padding: 0;
            position: relative;
        }
        
        /* Header Section */
        .receipt-header {
            background: #2563eb;
            color: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 4px;
            position: relative;
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .school-info h1 {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 4px;
        }
        
        .school-info p {
            font-size: 12px;
            opacity: 0.9;
        }
        
        .receipt-info {
            text-align: right;
        }
        
        .receipt-info h2 {
            font-size: 16px;
            margin-bottom: 8px;
        }
        
        .receipt-number {
            background: rgba(255,255,255,0.2);
            padding: 8px 12px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-weight: bold;
        }
        
        /* Table Styles */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border: 1px solid #ddd;
        }
        
        .info-table th {
            background: #f8f9fa;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
        }
        
        .info-table td {
            padding: 8px 10px;
            border: 1px solid #ddd;
            font-size: 12px;
        }
        
        .info-table tr:nth-child(even) {
            background: #f9f9f9;
        }
        
        .section-header {
            background: #2563eb;
            color: white;
            font-weight: bold;
            text-align: center;
            padding: 8px;
            font-size: 13px;
        }
        
        .amount-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            border: 2px solid #2563eb;
        }
        
        .amount-table th {
            background: #2563eb;
            color: white;
            font-weight: bold;
            text-align: center;
            padding: 12px;
            font-size: 14px;
        }
        
        .amount-table td {
            padding: 10px;
            border: 1px solid #ddd;
            font-size: 13px;
        }
        
        .amount-table .label-col {
            font-weight: 600;
            background: #f8f9fa;
            width: 60%;
        }
        
        .amount-table .value-col {
            text-align: right;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            width: 40%;
        }
        
        .total-row {
            background: #e7f3ff !important;
            border: 2px solid #2563eb !important;
        }
        
        .total-row td {
            font-size: 16px;
            font-weight: bold;
            color: #2563eb;
            border: 2px solid #2563eb !important;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status-successful {
            background: #d4ffd4;
            color: #0d7218;
            border: 1px solid #0d7218;
        }
        
        .status-pending {
            background: #fff4d4;
            color: #856404;
            border: 1px solid #856404;
        }
        
        .status-failed {
            background: #ffd4d4;
            color: #721c24;
            border: 1px solid #721c24;
        }
        
        /* Footer */
        .receipt-footer {
            margin-top: 30px;
            padding: 15px;
            border-top: 2px solid #2563eb;
            text-align: center;
            font-size: 11px;
            color: #666;
        }
        
        .footer-title {
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .footer-note {
            margin-bottom: 10px;
            line-height: 1.4;
        }
        
        .contact-info {
            border-top: 1px solid #ddd;
            padding-top: 10px;
            margin-top: 10px;
            font-size: 10px;
            color: #888;
        }
        
        /* Print Styles */
        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            
            .receipt-container {
                width: 100%;
                margin: 0;
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <!-- Header -->
        <div class="receipt-header">
            <div class="header-content">
                <div class="school-info">
                    <h1>{{ config('app.name', 'Excellence Academy') }}</h1>
                    <p>School Management System - Official Payment Receipt</p>
                </div>
                <div class="receipt-info">
                    <h2>RECEIPT</h2>
                    <div class="receipt-number">{{ $payment->receipt_number }}</div>
                </div>
            </div>
        </div>
        
        <!-- Student Information Table -->
        <table class="info-table">
            <thead>
                <tr>
                    <th colspan="4" class="section-header">STUDENT INFORMATION</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Student Name:</strong></td>
                    <td>{{ $payment->student->user->name }}</td>
                    <td><strong>Student ID:</strong></td>
                    <td>{{ $payment->student->admission_number }}</td>
                </tr>
                <tr>
                    <td><strong>Class:</strong></td>
                    <td>{{ $payment->student->classroom->name ?? 'N/A' }}</td>
                    <td><strong>Email:</strong></td>
                    <td>{{ $payment->student->user->email }}</td>
                </tr>
            </tbody>
        </table>
        
        <!-- Payment Information Table -->
        <table class="info-table">
            <thead>
                <tr>
                    <th colspan="4" class="section-header">PAYMENT INFORMATION</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Payment Reference:</strong></td>
                    <td>{{ $payment->payment_reference }}</td>
                    <td><strong>Payment Date:</strong></td>
                    <td>{{ $payment->paid_at ? $payment->paid_at->format('F j, Y g:i A') : 'N/A' }}</td>
                </tr>
                <tr>
                    <td><strong>Payment Method:</strong></td>
                    <td>{{ ucfirst($payment->payment_method) }}</td>
                    <td><strong>Status:</strong></td>
                    <td>
                        <span class="status-badge status-{{ $payment->status }}">
                            {{ ucfirst($payment->status) }}
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
        
        <!-- Fee Information Table -->
        <table class="info-table">
            <thead>
                <tr>
                    <th colspan="4" class="section-header">FEE INFORMATION</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Fee Name:</strong></td>
                    <td>{{ $payment->fee->name }}</td>
                    <td><strong>Academic Session:</strong></td>
                    <td>{{ $payment->fee->academicSession->name ?? '2024/2025' }}</td>
                </tr>
                <tr>
                    <td><strong>Fee Description:</strong></td>
                    <td>{{ $payment->fee->description ?? 'Library maintenance and book acquisition' }}</td>
                    <td><strong>Term:</strong></td>
                    <td>{{ $payment->fee->term->name ?? 'First Term' }}</td>
                </tr>
                @if($payment->fee->due_date)
                <tr>
                    <td><strong>Due Date:</strong></td>
                    <td>{{ $payment->fee->due_date->format('F j, Y') }}</td>
                    <td><strong>Currency:</strong></td>
                    <td>{{ $payment->currency ?? 'NGN' }}</td>
                </tr>
                @endif
            </tbody>
        </table>
        
        <!-- Payment Summary Table -->
        <table class="amount-table">
            <thead>
                <tr>
                    <th colspan="2">PAYMENT SUMMARY</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="label-col">Total Fee Amount:</td>
                    <td class="value-col">₦{{ number_format($payment->fee_amount ?? 73000, 2) }}</td>
                </tr>
                @if($payment->is_partial_payment)
                <tr>
                    <td class="label-col">Previous Payments:</td>
                    <td class="value-col">₦{{ number_format(($payment->balance_before ?? 73000) - ($payment->fee_amount ?? 73000), 2) }}</td>
                </tr>
                <tr>
                    <td class="label-col">Balance Before Payment:</td>
                    <td class="value-col">₦{{ number_format($payment->balance_before ?? 73000, 2) }}</td>
                </tr>
                @endif
                <tr class="total-row">
                    <td class="label-col">Amount Paid:</td>
                    <td class="value-col">₦{{ number_format($payment->amount ?? 7400, 2) }}</td>
                </tr>
                @if(($payment->balance_after ?? 72600) > 0)
                <tr>
                    <td class="label-col">Remaining Balance:</td>
                    <td class="value-col">₦{{ number_format($payment->balance_after ?? 72600, 2) }}</td>
                </tr>
                @endif
            </tbody>
        </table>
        
        @if($payment->paystack_reference)
        <!-- Transaction Details Table -->
        <table class="info-table">
            <thead>
                <tr>
                    <th colspan="4" class="section-header">TRANSACTION DETAILS</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Paystack Reference:</strong></td>
                    <td colspan="3">{{ $payment->paystack_reference }}</td>
                </tr>
                <tr>
                    <td><strong>Transaction ID:</strong></td>
                    <td colspan="3">{{ $payment->payment_reference }}</td>
                </tr>
            </tbody>
        </table>
        @endif
        
        <!-- Footer -->
        <div class="receipt-footer">
            <div class="footer-title">Thank you for your payment!</div>
            <div class="footer-note">
                This is an official payment receipt generated by {{ config('app.name', 'Excellence Academy') }}.<br>
                This receipt serves as proof of payment and should be retained for your records.
            </div>
            <div class="contact-info">
                Generated on {{ now()->format('F j, Y g:i A') }} | Receipt ID: {{ $payment->receipt_number }}<br>
                Email: finance@excellenceacademy.edu.ng | Phone: +234-XXX-XXX-XXXX
            </div>
        </div>
    </div>
</body>
</html>
