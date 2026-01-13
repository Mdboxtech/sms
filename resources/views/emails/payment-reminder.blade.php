<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Payment Reminder</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 30px 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
            margin: -20px -20px 20px -20px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .reminder-badge {
            background-color: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            display: inline-block;
            margin-top: 10px;
        }
        .due-notice {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .payment-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: 600;
            color: #495057;
        }
        .detail-value {
            color: #212529;
            font-weight: 500;
        }
        .amount-highlight {
            font-size: 18px;
            font-weight: 700;
            color: #d97706;
        }
        .pay-now-btn {
            background-color: #10b981;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            margin: 20px 0;
            font-weight: 600;
            font-size: 16px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
        }
        .school-info {
            text-align: center;
            margin-bottom: 20px;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ config('app.name') }}</h1>
            <div class="reminder-badge">Payment Reminder</div>
        </div>

        <div class="school-info">
            <p>Fee Payment Reminder Notice</p>
        </div>

        <p>Dear {{ $student->user->name }},</p>

        <div class="due-notice">
            <strong>⏰ Payment Reminder:</strong> 
            @if($daysUntilDue > 0)
                Your fee payment is due in {{ $daysUntilDue }} day{{ $daysUntilDue > 1 ? 's' : '' }}.
            @elseif($daysUntilDue == 0)
                Your fee payment is due today!
            @else
                Your fee payment was due {{ abs($daysUntilDue) }} day{{ abs($daysUntilDue) > 1 ? 's' : '' }} ago.
            @endif
        </div>

        <p>This is a friendly reminder about your upcoming/overdue fee payment. Please review the details below:</p>

        <div class="payment-details">
            <div class="detail-row">
                <span class="detail-label">Fee Name:</span>
                <span class="detail-value">{{ $fee->name }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value amount-highlight">₦{{ number_format($feeStatus['total_amount'], 2) }}</span>
            </div>
            @if($feeStatus['paid_amount'] > 0)
            <div class="detail-row">
                <span class="detail-label">Amount Paid:</span>
                <span class="detail-value">₦{{ number_format($feeStatus['paid_amount'], 2) }}</span>
            </div>
            @endif
            <div class="detail-row">
                <span class="detail-label">Outstanding Balance:</span>
                <span class="detail-value amount-highlight">₦{{ number_format($feeStatus['balance'], 2) }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Due Date:</span>
                <span class="detail-value">{{ $fee->due_date ? $fee->due_date->format('F j, Y') : 'N/A' }}</span>
            </div>
            @if($fee->academicSession)
            <div class="detail-row">
                <span class="detail-label">Academic Session:</span>
                <span class="detail-value">{{ $fee->academicSession->name }}</span>
            </div>
            @endif
            @if($fee->term)
            <div class="detail-row">
                <span class="detail-label">Term:</span>
                <span class="detail-value">{{ $fee->term->name }}</span>
            </div>
            @endif
        </div>

        @if($feeStatus['balance'] > 0)
            <div style="text-align: center;">
                <a href="{{ route('student.payments.dashboard') }}" class="pay-now-btn">
                    Pay Now - ₦{{ number_format($feeStatus['balance'], 2) }}
                </a>
            </div>

            <p><strong>Payment Options:</strong></p>
            <ul>
                <li>Online payment via Paystack (Card, Bank Transfer, USSD)</li>
                @if($fee->allow_partial_payment)
                <li>Partial payments are allowed for this fee</li>
                @endif
                <li>Visit the school's finance office for cash payments</li>
            </ul>
        @endif

        @if($daysUntilDue < 0 && $fee->late_fee_amount > 0)
            <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <strong>⚠️ Late Fee Notice:</strong> A late fee of ₦{{ number_format($fee->late_fee_amount, 2) }} may apply after the grace period ends.
            </div>
        @endif

        <p><strong>Important:</strong> To avoid any late fees or academic holds, please ensure your payment is made promptly. If you're experiencing financial difficulties, please contact the school's finance office to discuss payment arrangements.</p>

        <div class="footer">
            <p>This is an automated reminder from {{ config('app.name') }}.</p>
            <p>For support or inquiries, please contact the school finance office.</p>
        </div>
    </div>
</body>
</html>
