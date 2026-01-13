<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\Payment;
use App\Models\Student;
use App\Models\AcademicSession;
use App\Models\Term;
use App\Services\PaystackService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class PaymentController extends Controller
{
    protected $paystackService;

    public function __construct(PaystackService $paystackService)
    {
        $this->paystackService = $paystackService;
    }

    /**
     * Display student payment dashboard
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        $currentSession = AcademicSession::where('is_current', true)->first();
        $currentTerm = Term::where('is_current', true)->first();

        // Get applicable fees for the student
        $fees = Fee::where(function($query) use ($student, $currentSession, $currentTerm) {
                $query->where('classroom_id', $student->classroom_id)
                      ->orWhereNull('classroom_id');
            })
            ->where(function($query) use ($currentSession) {
                $query->where('academic_session_id', $currentSession?->id)
                      ->orWhereNull('academic_session_id');
            })
            ->where(function($query) use ($currentTerm) {
                $query->where('term_id', $currentTerm?->id)
                      ->orWhereNull('term_id');
            })
            ->where('is_active', true)
            ->with(['classroom', 'academicSession', 'term'])
            ->get();

        // Get student's payment history
        $payments = Payment::where('student_id', $student->id)
            ->with(['fee'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate statistics
        $totalFees = $fees->sum('amount');
        $totalPaid = $payments->where('status', 'successful')->sum('amount');
        $outstanding = $totalFees - $totalPaid;
        $transactionCount = $payments->count();

        $statistics = [
            'total_fees' => $totalFees,
            'total_paid' => $totalPaid,
            'outstanding' => $outstanding,
            'transaction_count' => $transactionCount,
        ];

        return Inertia::render('Student/Payments/Dashboard', [
            'student' => $student->load('user', 'classroom'),
            'fees' => $fees,
            'payments' => $payments,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Display payment history
     */
    public function history(Request $request)
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        $query = Payment::where('student_id', $student->id)
            ->with(['fee']);

        // Apply filters
        if ($request->filled('search')) {
            $query->where('transaction_reference', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('fee_id')) {
            $query->where('fee_id', $request->fee_id);
        }

        if ($request->filled('month')) {
            $query->whereMonth('created_at', $request->month);
        }

        $payments = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        // Get all fees for filter options
        $fees = Fee::where(function($q) use ($student) {
                $q->where('classroom_id', $student->classroom_id)
                  ->orWhereNull('classroom_id');
            })
            ->where('is_active', true)
            ->get(['id', 'name']);

        // Calculate statistics
        $statistics = [
            'total_paid' => Payment::where('student_id', $student->id)
                ->where('status', 'successful')
                ->sum('amount'),
            'transaction_count' => Payment::where('student_id', $student->id)->count(),
            'pending_count' => Payment::where('student_id', $student->id)
                ->where('status', 'pending')
                ->count(),
            'failed_count' => Payment::where('student_id', $student->id)
                ->where('status', 'failed')
                ->count(),
        ];

        return Inertia::render('Student/Payments/History', [
            'payments' => $payments,
            'filters' => $request->only(['search', 'status', 'fee_id', 'month']),
            'fees' => $fees,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Initialize payment for a fee
     */
    public function initiate(Request $request)
    {
        $request->validate([
            'fee_id' => 'required|exists:fees,id',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'nullable|in:paystack,bank_transfer',
            'payment_id' => 'nullable|exists:payments,id',
        ]);

        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();
        $fee = Fee::findOrFail($request->fee_id);

        // If payment_id is provided, verify it belongs to the student
        if ($request->payment_id) {
            $existingPayment = Payment::where('id', $request->payment_id)
                ->where('student_id', $student->id)
                ->first();
            
            if (!$existingPayment) {
                return back()->with('error', 'Payment record not found.');
            }
        }

        // Verify fee is available to this student
        if ($fee->classroom_id && $fee->classroom_id !== $student->classroom_id) {
            return back()->with('error', 'This fee is not applicable to your class.');
        }

        // Check if fee is active
        if (!$fee->is_active) {
            return back()->with('error', 'This fee is currently not available for payment.');
        }

        // Apply payment rules from settings
        $feeStatus = $fee->getStatusForStudent($student->id);
        $requestedAmount = $request->amount;

        // Check minimum payment amount
        $minimumAmount = (float) \App\Models\Setting::getValue('minimum_payment_amount', 100);
        if ($requestedAmount < $minimumAmount) {
            return back()->with('error', "Minimum payment amount is ₦" . number_format($minimumAmount, 2));
        }

        // Check if partial payments are allowed
        $allowPartialPayments = \App\Models\Setting::getValue('allow_partial_payments', true);
        $isPartialPayment = $requestedAmount < $feeStatus['balance'];
        
        if ($isPartialPayment && !$allowPartialPayments) {
            return back()->with('error', 'Partial payments are not allowed for this fee. Please pay the full amount of ₦' . number_format($feeStatus['balance'], 2));
        }

        // Ensure payment amount doesn't exceed outstanding balance
        if ($requestedAmount > $feeStatus['balance']) {
            return back()->with('error', 'Payment amount cannot exceed outstanding balance of ₦' . number_format($feeStatus['balance'], 2));
        }

        try {
            // Default to paystack if no payment method specified
            $paymentMethod = $request->payment_method ?? 'paystack';
            
            if ($paymentMethod === 'paystack') {
                $result = $this->paystackService->createPayment(
                    $student,
                    $fee,
                    $request->amount,
                    [
                        'callback_url' => route('student.payments.callback'),
                        'existing_payment_id' => $request->payment_id
                    ]
                );

                if ($result['status']) {
                    return Inertia::location($result['data']['paystack']['authorization_url']);
                } else {
                    return back()->with('error', $result['message']);
                }
            }

            return back()->with('error', 'Payment method not supported yet.');

        } catch (\Exception $e) {
            return back()->with('error', 'Payment initialization failed. Please try again.');
        }
    }

    /**
     * Handle payment callback from Paystack
     */
    public function callback(Request $request)
    {
        $reference = $request->get('reference');
        
        if (!$reference) {
            return redirect()->route('student.payments.dashboard')
                ->with('error', 'Invalid payment reference.');
        }

        try {
            $result = $this->paystackService->processPaymentVerification($reference);

            if ($result['status']) {
                return redirect()->route('student.payments.success', ['reference' => $reference])
                    ->with('success', 'Payment completed successfully!');
            } else {
                return redirect()->route('student.payments.failed', ['reference' => $reference])
                    ->with('error', $result['message']);
            }

        } catch (\Exception $e) {
            return redirect()->route('student.payments.dashboard')
                ->with('error', 'Payment verification failed. Please contact support.');
        }
    }

    /**
     * Show payment success page
     */
    public function success(Request $request)
    {
        $reference = $request->get('reference');
        $payment = Payment::where('payment_reference', $reference)
            ->orWhere('paystack_reference', $reference)
            ->with(['fee', 'student.user'])
            ->first();

        if (!$payment) {
            return redirect()->route('student.payments.dashboard')
                ->with('error', 'Payment record not found.');
        }

        // Verify this payment belongs to current user
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->first();
        
        if ($payment->student_id !== $student->id) {
            return redirect()->route('student.payments.dashboard')
                ->with('error', 'Access denied.');
        }

        return Inertia::render('Student/Payments/Success', [
            'payment' => $payment,
        ]);
    }

    /**
     * Show payment failed page
     */
    public function failed(Request $request)
    {
        $reference = $request->get('reference');
        $payment = Payment::where('payment_reference', $reference)
            ->orWhere('paystack_reference', $reference)
            ->with(['fee', 'student.user'])
            ->first();

        return Inertia::render('Student/Payments/Failed', [
            'payment' => $payment,
            'reference' => $reference,
        ]);
    }

    /**
     * Show payment details
     */
    public function show(Payment $payment)
    {
        // Verify payment belongs to current user
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->first();
        
        if ($payment->student_id !== $student->id) {
            abort(403, 'Access denied.');
        }

        $payment->load(['fee', 'student.user']);

        return Inertia::render('Student/Payments/Show', [
            'payment' => $payment,
        ]);
    }

    /**
     * Download payment receipt
     */
    public function downloadReceipt(Payment $payment)
    {
        // Verify payment belongs to current user
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->first();
        
        if ($payment->student_id !== $student->id) {
            abort(403, 'Access denied.');
        }

        if ($payment->status !== 'successful') {
            return back()->with('error', 'Receipt is only available for successful payments.');
        }

        // Generate and return PDF receipt
        $pdf = $this->generateReceiptPDF($payment);
        
        return response()->streamDownload(
            fn() => print($pdf),
            "receipt-{$payment->payment_reference}.pdf",
            ['Content-Type' => 'application/pdf']
        );
    }

    /**
     * Verify payment status
     */
    public function verify(Request $request)
    {
        $request->validate([
            'reference' => 'required|string',
        ]);

        try {
            $result = $this->paystackService->processPaymentVerification($request->reference);
            
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Verification failed. Please try again.',
            ], 500);
        }
    }

    /**
     * Get fee details for payment
     */
    public function feeDetails(Fee $fee)
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->first();

        // Check if fee is applicable to student
        if ($fee->classroom_id && $fee->classroom_id !== $student->classroom_id) {
            abort(403, 'Fee not applicable to your class.');
        }

        $totalPaid = Payment::where('student_id', $student->id)
            ->where('fee_id', $fee->id)
            ->where('status', 'successful')
            ->sum('amount');

        $amountOwed = max(0, $fee->amount - $totalPaid);

        return response()->json([
            'fee' => $fee,
            'total_paid' => $totalPaid,
            'amount_owed' => $amountOwed,
        ]);
    }

    /**
     * Generate PDF receipt for payment
     */
    private function generateReceiptPDF(Payment $payment)
    {
        // Load related models
        $payment->load(['student.user', 'student.classroom', 'fee.academicSession', 'fee.term']);
        
        // Generate PDF using the blade template
        $pdf = Pdf::loadView('receipts.payment-receipt', compact('payment'));
        
        // Set PDF options
        $pdf->setPaper('A4', 'portrait');
        $pdf->setOptions([
            'dpi' => 150,
            'defaultFont' => 'Arial',
            'isHtml5ParserEnabled' => true,
            'isPhpEnabled' => true
        ]);
        
        return $pdf->output();
    }
}
