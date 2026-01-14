<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Payment;
use App\Models\Student;
use App\Models\Fee;
use App\Models\Setting;
use App\Services\PaymentNotificationService;
use Exception;

class PaystackService
{
    protected $secretKey;
    protected $publicKey;
    protected $baseUrl;
    protected $currency;

    public function __construct()
    {
        $this->secretKey = Setting::getValue('paystack_secret_key', '');
        $this->publicKey = Setting::getValue('paystack_public_key', '');
        $this->baseUrl = rtrim(Setting::getValue('paystack_payment_url', 'https://api.paystack.co'), '/');
        $this->currency = Setting::getValue('app_currency', 'NGN');
    }

    /**
     * Initialize a payment transaction
     */
    public function initializePayment(array $data): array
    {
        $this->validateCredentials();

        $payload = [
            'email' => $data['email'],
            'amount' => (int) ($data['amount'] * 100), // Convert to kobo
            'currency' => $this->currency,
            'reference' => $data['reference'],
            'callback_url' => $data['callback_url'] ?? null,
            'metadata' => [
                'student_id' => $data['student_id'],
                'fee_id' => $data['fee_id'],
                'payment_type' => $data['payment_type'] ?? 'fee_payment',
                'custom_fields' => [
                    [
                        'display_name' => 'Student Name',
                        'variable_name' => 'student_name',
                        'value' => $data['student_name'] ?? '',
                    ],
                    [
                        'display_name' => 'Fee Name',
                        'variable_name' => 'fee_name',
                        'value' => $data['fee_name'] ?? '',
                    ],
                ]
            ],
            'channels' => config('paystack.channels', ['card', 'bank']),
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/transaction/initialize', $payload);

            if ($response->successful()) {
                $data = $response->json();
                
                Log::info('Paystack payment initialized', [
                    'reference' => $payload['reference'],
                    'student_id' => $payload['metadata']['student_id'],
                    'amount' => $payload['amount'] / 100
                ]);

                return [
                    'status' => true,
                    'message' => 'Payment initialized successfully',
                    'data' => $data['data']
                ];
            }

            $error = $response->json();
            Log::error('Paystack initialization failed', [
                'payload' => $payload,
                'response' => $error
            ]);

            return [
                'status' => false,
                'message' => $error['message'] ?? 'Payment initialization failed',
                'data' => null
            ];

        } catch (Exception $e) {
            Log::error('Paystack initialization exception', [
                'message' => $e->getMessage(),
                'payload' => $payload
            ]);

            return [
                'status' => false,
                'message' => 'Payment initialization failed: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Verify a payment transaction
     */
    public function verifyPayment(string $reference): array
    {
        $this->validateCredentials();

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
            ])->get($this->baseUrl . '/transaction/verify/' . $reference);

            if ($response->successful()) {
                $data = $response->json();
                
                Log::info('Paystack payment verified', [
                    'reference' => $reference,
                    'status' => $data['data']['status'] ?? 'unknown'
                ]);

                return [
                    'status' => true,
                    'message' => 'Payment verified successfully',
                    'data' => $data['data']
                ];
            }

            $error = $response->json();
            Log::error('Paystack verification failed', [
                'reference' => $reference,
                'response' => $error
            ]);

            return [
                'status' => false,
                'message' => $error['message'] ?? 'Payment verification failed',
                'data' => null
            ];

        } catch (Exception $e) {
            Log::error('Paystack verification exception', [
                'reference' => $reference,
                'message' => $e->getMessage()
            ]);

            return [
                'status' => false,
                'message' => 'Payment verification failed: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Create a payment record and initialize Paystack transaction
     */
    public function createPayment(Student $student, Fee $fee, float $amount, array $options = []): array
    {
        try {
            // Validate payment amount
            if ($amount <= 0) {
                return [
                    'status' => false,
                    'message' => 'Payment amount must be greater than zero',
                    'data' => null
                ];
            }

            // Check if partial payment is allowed
            $feeStatus = $fee->getStatusForStudent($student->id);
            $maxAmount = $feeStatus['balance'];

            if ($amount > $maxAmount) {
                return [
                    'status' => false,
                    'message' => "Payment amount cannot exceed outstanding balance of ₦" . number_format($maxAmount, 2),
                    'data' => null
                ];
            }

            // Handle existing payment or create new one
            if (isset($options['existing_payment_id'])) {
                $payment = Payment::find($options['existing_payment_id']);
                
                if (!$payment || $payment->student_id !== $student->id) {
                    return [
                        'status' => false,
                        'message' => 'Payment record not found',
                        'data' => null
                    ];
                }

                // Update payment record for retry
                $payment->update([
                    'amount' => $amount,
                    'status' => 'pending',
                    'paystack_reference' => null,
                    'paystack_access_code' => null,
                ]);
            } else {
                // Create new payment record
                $payment = Payment::create([
                    'student_id' => $student->id,
                    'fee_id' => $fee->id,
                    'amount' => $amount,
                    'fee_amount' => $fee->getTotalAmountWithLateFee(),
                    'payment_method' => 'paystack',
                    'status' => 'pending',
                    'currency' => $this->currency,
                    'is_partial_payment' => $amount < $feeStatus['total_amount'],
                    'balance_before' => $feeStatus['balance'],
                    'balance_after' => $feeStatus['balance'] - $amount,
                ]);
            }

            // Initialize Paystack payment
            $paystackData = [
                'email' => $student->user->email,
                'amount' => $amount,
                'reference' => $payment->payment_reference,
                'student_id' => $student->id,
                'fee_id' => $fee->id,
                'student_name' => $student->user->name,
                'fee_name' => $fee->name,
                'callback_url' => $options['callback_url'] ?? route('student.payments.callback'),
            ];

            $result = $this->initializePayment($paystackData);

            if ($result['status']) {
                // Update payment with Paystack data
                $payment->update([
                    'paystack_reference' => $result['data']['reference'],
                    'paystack_access_code' => $result['data']['access_code'],
                ]);

                return [
                    'status' => true,
                    'message' => 'Payment created successfully',
                    'data' => [
                        'payment' => $payment,
                        'paystack' => $result['data']
                    ]
                ];
            } else {
                // Delete the payment record if Paystack initialization failed
                $payment->delete();
                return $result;
            }

        } catch (Exception $e) {
            Log::error('Create payment exception', [
                'student_id' => $student->id,
                'fee_id' => $fee->id,
                'amount' => $amount,
                'message' => $e->getMessage()
            ]);

            return [
                'status' => false,
                'message' => 'Payment creation failed: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Process payment verification and update records
     */
    public function processPaymentVerification(string $reference): array
    {
        try {
            // Find payment record
            $payment = Payment::where('payment_reference', $reference)
                ->orWhere('paystack_reference', $reference)
                ->first();

            if (!$payment) {
                return [
                    'status' => false,
                    'message' => 'Payment record not found',
                    'data' => null
                ];
            }

            // Verify with Paystack
            $verification = $this->verifyPayment($payment->paystack_reference ?? $reference);

            if (!$verification['status']) {
                return $verification;
            }

            $paystackData = $verification['data'];
            $paystackStatus = $paystackData['status'];

            // Update payment based on Paystack status
            if ($paystackStatus === 'success') {
                $payment->markAsSuccessful($paystackData);
                
                // Update fee balance if needed
                $this->updateFeeBalance($payment);

                // Process payment rules and send notifications
                $notificationService = app(PaymentNotificationService::class);
                $notificationService->processPaymentRules($payment);

                Log::info('Payment completed successfully', [
                    'payment_id' => $payment->id,
                    'reference' => $reference,
                    'amount' => $payment->amount
                ]);

                return [
                    'status' => true,
                    'message' => 'Payment completed successfully',
                    'data' => [
                        'payment' => $payment->fresh(),
                        'paystack' => $paystackData
                    ]
                ];

            } else {
                $payment->markAsFailed($paystackData);

                return [
                    'status' => false,
                    'message' => 'Payment was not successful',
                    'data' => [
                        'payment' => $payment->fresh(),
                        'paystack' => $paystackData
                    ]
                ];
            }

        } catch (Exception $e) {
            Log::error('Payment verification processing exception', [
                'reference' => $reference,
                'message' => $e->getMessage()
            ]);

            return [
                'status' => false,
                'message' => 'Payment verification failed: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Handle Paystack webhook
     */
    public function handleWebhook(array $payload): array
    {
        try {
            $event = $payload['event'];
            $data = $payload['data'];

            Log::info('Paystack webhook received', [
                'event' => $event,
                'reference' => $data['reference'] ?? 'unknown'
            ]);

            switch ($event) {
                case 'charge.success':
                    return $this->processPaymentVerification($data['reference']);

                case 'charge.failed':
                    $payment = Payment::where('paystack_reference', $data['reference'])->first();
                    if ($payment) {
                        $payment->markAsFailed($data);
                    }
                    break;

                default:
                    Log::info('Unhandled webhook event', ['event' => $event]);
            }

            return [
                'status' => true,
                'message' => 'Webhook processed successfully',
                'data' => null
            ];

        } catch (Exception $e) {
            Log::error('Webhook processing exception', [
                'payload' => $payload,
                'message' => $e->getMessage()
            ]);

            return [
                'status' => false,
                'message' => 'Webhook processing failed: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Get payment statistics
     */
    public function getPaymentStatistics(array $filters = []): array
    {
        $query = Payment::query();

        if (isset($filters['student_id'])) {
            $query->where('student_id', $filters['student_id']);
        }

        if (isset($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        $totalPayments = $query->count();
        $successfulPayments = $query->where('status', 'successful')->count();
        $pendingPayments = $query->where('status', 'pending')->count();
        $failedPayments = $query->where('status', 'failed')->count();
        $totalAmount = $query->where('status', 'successful')->sum('amount');

        return [
            'total_payments' => $totalPayments,
            'successful_payments' => $successfulPayments,
            'pending_payments' => $pendingPayments,
            'failed_payments' => $failedPayments,
            'total_amount' => $totalAmount,
            'success_rate' => $totalPayments > 0 ? round(($successfulPayments / $totalPayments) * 100, 2) : 0,
        ];
    }

    /**
     * Validate Paystack credentials
     */
    protected function validateCredentials(): void
    {
        if (empty($this->secretKey) || empty($this->publicKey)) {
            throw new Exception('Paystack credentials are not configured properly');
        }
    }

    /**
     * Update fee balance after successful payment
     */
    protected function updateFeeBalance(Payment $payment): void
    {
        // This could trigger events for invoice updates, notifications, etc.
        // For now, the fee status is calculated dynamically in the Fee model
        Log::info('Fee balance updated', [
            'payment_id' => $payment->id,
            'student_id' => $payment->student_id,
            'fee_id' => $payment->fee_id,
            'amount_paid' => $payment->amount
        ]);
    }

    /**
     * Get Paystack public key for frontend
     */
    public function getPublicKey(): string
    {
        return $this->publicKey;
    }

    /**
     * Test Paystack connection
     */
    public function testConnection(): array
    {
        try {
            $this->validateCredentials();

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
            ])->get($this->baseUrl . '/bank');

            if ($response->successful()) {
                return [
                    'status' => true,
                    'message' => 'Paystack connection successful',
                    'data' => null
                ];
            }

            return [
                'status' => false,
                'message' => 'Paystack connection failed',
                'data' => $response->json()
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => 'Connection test failed: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }
}
