<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Payment Confirmation</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        .success-badge {
            background-color: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            display: inline-block;
            margin-top: 10px;
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
            color: #10b981;
        }
        .receipt-link {
            background-color: #6366f1;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            margin: 20px 0;
            font-weight: 600;
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
            <div class="success-badge">Payment Successful</div>
        </div>

        <div class="school-info">
            <p>Official Payment Confirmation</p>
        </div>

        <p>Dear {{ $student->user->name }},</p>

        <p>Your payment has been successfully processed! Here are the details of your transaction:</p>

        <div class="payment-details">
            <div class="detail-row">
                <span class="detail-label">Fee Name:</span>
                <span class="detail-value">{{ $fee->name }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Amount Paid:</span>
                <span class="detail-value amount-highlight">₦{{ number_format($payment->amount, 2) }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Payment Reference:</span>
                <span class="detail-value">{{ $payment->payment_reference }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Payment Date:</span>
                <span class="detail-value">{{ $payment->paid_at ? $payment->paid_at->format('F j, Y - g:i A') : 'N/A' }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">{{ ucfirst($payment->payment_method) }}</span>
            </div>
            @if($payment->balance_after > 0)
            <div class="detail-row">
                <span class="detail-label">Remaining Balance:</span>
                <span class="detail-value">₦{{ number_format($payment->balance_after, 2) }}</span>
            </div>
            @endif
        </div>

        @if($payment->balance_after <= 0)
            <p style="color: #10b981; font-weight: 600;">✅ This fee has been fully paid.</p>
        @else
            <p style="color: #f59e0b; font-weight: 600;">⚠️ You have a remaining balance of ₦{{ number_format($payment->balance_after, 2) }} for this fee.</p>
        @endif

        <div style="text-align: center;">
            <a href="{{ route('student.payments.show', $payment) }}" class="receipt-link">
                View Receipt & Download PDF
            </a>
        </div>

        <p>If you have any questions about this payment or need assistance, please contact the school's finance office.</p>

        <div class="footer">
            <p>This is an automated message from {{ config('app.name') }}.</p>
            <p>Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
