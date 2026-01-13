<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Fee;
use App\Models\Student;
use App\Models\Classroom;
use App\Models\AcademicSession;
use App\Models\Term;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class PaymentController extends Controller
{
    /**
     * Display a listing of payment records
     */
    public function index(Request $request)
    {
        $query = Payment::with(['student.user', 'student.classroom', 'fee']);

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('transaction_reference', 'like', "%{$search}%")
                  ->orWhere('paystack_reference', 'like', "%{$search}%")
                  ->orWhereHas('student.user', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('fee', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('fee_id')) {
            $query->where('fee_id', $request->fee_id);
        }

        if ($request->filled('classroom_id')) {
            $query->whereHas('student', function($q) use ($request) {
                $q->where('classroom_id', $request->classroom_id);
            });
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('month')) {
            $query->whereMonth('created_at', $request->month);
        }

        if ($request->filled('year')) {
            $query->whereYear('created_at', $request->year);
        }

        $payments = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        // Get filter options
        $fees = Fee::orderBy('name')->get(['id', 'name']);
        $classrooms = Classroom::orderBy('name')->get(['id', 'name']);
        
        // Calculate statistics
        $statistics = [
            'total_payments' => Payment::count(),
            'successful_payments' => Payment::where('status', 'successful')->count(),
            'pending_payments' => Payment::where('status', 'pending')->count(),
            'failed_payments' => Payment::where('status', 'failed')->count(),
            'total_amount' => Payment::where('status', 'successful')->sum('amount'),
            'pending_amount' => Payment::where('status', 'pending')->sum('amount'),
        ];

        // Monthly revenue data for chart
        $monthlyRevenue = Payment::where('status', 'successful')
            ->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(amount) as total'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get();

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
            'filters' => $request->only([
                'search', 'status', 'fee_id', 'classroom_id', 
                'payment_method', 'date_from', 'date_to', 'month', 'year'
            ]),
            'fees' => $fees,
            'classrooms' => $classrooms,
            'statistics' => $statistics,
            'monthlyRevenue' => $monthlyRevenue,
            'paymentStatuses' => [
                'successful' => 'Successful',
                'pending' => 'Pending',
                'failed' => 'Failed',
            ],
            'paymentMethods' => [
                'paystack' => 'Paystack',
                'bank_transfer' => 'Bank Transfer',
                'cash' => 'Cash',
            ],
        ]);
    }

    /**
     * Display the specified payment
     */
    public function show(Payment $payment)
    {
        $payment->load(['student.user', 'student.classroom', 'fee', 'fee.academicSession', 'fee.term']);

        return Inertia::render('Admin/Payments/Show', [
            'payment' => $payment,
        ]);
    }

    /**
     * Download payment receipt
     */
    public function downloadReceipt(Payment $payment)
    {
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
     * Export payment records
     */
    public function export(Request $request)
    {
        // Implementation for exporting payment records
        // This could be CSV, Excel, PDF, etc.
        
        return response()->json([
            'message' => 'Export functionality will be implemented here'
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

    /**
     * Get payment analytics data
     */
    public function analytics(Request $request)
    {
        $period = $request->get('period', '30'); // days
        
        $analytics = [
            'revenue_trend' => Payment::where('status', 'successful')
                ->where('created_at', '>=', now()->subDays($period))
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('SUM(amount) as total'),
                    DB::raw('COUNT(*) as count')
                )
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
                
            'fee_breakdown' => Payment::where('status', 'successful')
                ->where('created_at', '>=', now()->subDays($period))
                ->join('fees', 'payments.fee_id', '=', 'fees.id')
                ->select(
                    'fees.name',
                    DB::raw('SUM(payments.amount) as total'),
                    DB::raw('COUNT(*) as count')
                )
                ->groupBy('fees.id', 'fees.name')
                ->orderBy('total', 'desc')
                ->get(),
                
            'payment_methods' => Payment::where('status', 'successful')
                ->where('created_at', '>=', now()->subDays($period))
                ->select(
                    'payment_method',
                    DB::raw('SUM(amount) as total'),
                    DB::raw('COUNT(*) as count')
                )
                ->groupBy('payment_method')
                ->get(),
        ];

        return response()->json($analytics);
    }
}
