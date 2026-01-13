<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Overdue Payment Notice</title>
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
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
        .overdue-badge {
            background-color: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            display: inline-block;
            margin-top: 10px;
        }
        .urgent-notice {
            background-color: #fee2e2;
            border-left: 4px solid #ef4444;
            padding: 20px;
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
            color: #dc2626;
        }
        .late-fee-notice {
            background-color: #fef3c7;
            border: 2px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
        }
        .pay-urgent-btn {
            background-color: #dc2626;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            margin: 20px 0;
            font-weight: 600;
            font-size: 16px;
        }
        .consequences {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
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
            <div class="overdue-badge">Overdue Payment Notice</div>
        </div>

        <div class="school-info">
            <p>Urgent: Fee Payment Overdue</p>
        </div>

        <p>Dear {{ $student->user->name }},</p>

        <div class="urgent-notice">
            <strong>🚨 URGENT: Payment Overdue</strong><br>
            Your fee payment is {{ $daysOverdue }} day{{ $daysOverdue > 1 ? 's' : '' }} overdue. Immediate action is required to avoid further consequences.
        </div>

        <p>This is an important notice regarding your overdue fee payment. Please review the details below and make your payment immediately:</p>

        <div class="payment-details">
            <div class="detail-row">
                <span class="detail-label">Fee Name:</span>
                <span class="detail-value">{{ $fee->name }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Original Amount:</span>
                <span class="detail-value">₦{{ number_format($fee->amount, 2) }}</span>
            </div>
            @if($lateFee > 0 && $gracePeriodEnded)
            <div class="detail-row">
                <span class="detail-label">Late Fee:</span>
                <span class="detail-value amount-highlight">₦{{ number_format($lateFee, 2) }}</span>
            </div>
            @endif
            <div class="detail-row">
                <span class="detail-label">Total Amount Due:</span>
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
                <span class="detail-label">Original Due Date:</span>
                <span class="detail-value">{{ $fee->due_date ? $fee->due_date->format('F j, Y') : 'N/A' }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Days Overdue:</span>
                <span class="detail-value amount-highlight">{{ $daysOverdue }} day{{ $daysOverdue > 1 ? 's' : '' }}</span>
            </div>
        </div>

        @if($lateFee > 0)
            @if($gracePeriodEnded)
                <div class="late-fee-notice">
                    <strong>💰 Late Fee Applied:</strong> A late fee of ₦{{ number_format($lateFee, 2) }} has been added to your account due to the overdue payment.
                </div>
            @else
                <div class="late-fee-notice">
                    <strong>⏰ Grace Period Ending:</strong> You have {{ $fee->grace_period_days - $daysOverdue }} day{{ ($fee->grace_period_days - $daysOverdue) > 1 ? 's' : '' }} left before a late fee of ₦{{ number_format($fee->late_fee_amount, 2) }} is applied.
                </div>
            @endif
        @endif

        <div style="text-align: center;">
            <a href="{{ route('student.payments.dashboard') }}" class="pay-urgent-btn">
                Pay Now - ₦{{ number_format($feeStatus['balance'], 2) }}
            </a>
        </div>

        <div class="consequences">
            <strong>⚠️ Consequences of Non-Payment:</strong>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Academic hold may be placed on your account</li>
                <li>You may be restricted from taking examinations</li>
                <li>Access to school facilities may be limited</li>
                <li>Additional administrative fees may apply</li>
                <li>Your academic records may be withheld</li>
            </ul>
        </div>

        <p><strong>Payment Options:</strong></p>
        <ul>
            <li><strong>Online:</strong> Pay instantly via Paystack (Card, Bank Transfer, USSD)</li>
            <li><strong>In Person:</strong> Visit the school's finance office</li>
            @if($fee->allow_partial_payment)
            <li><strong>Partial Payment:</strong> Make a partial payment to reduce the outstanding balance</li>
            @endif
        </ul>

        <p><strong>Need Help?</strong> If you're experiencing financial difficulties or have questions about your payment, please contact the school's finance office immediately at [contact information] to discuss payment arrangements.</p>

        <p style="color: #dc2626; font-weight: 600;">This matter requires your immediate attention. Please make your payment or contact the finance office within 24 hours of receiving this notice.</p>

        <div class="footer">
            <p>This is an automated notice from {{ config('app.name') }}.</p>
            <p><strong>Finance Office:</strong> [Contact Information]</p>
            <p><strong>Office Hours:</strong> [Office Hours]</p>
        </div>
    </div>
</body>
</html>
