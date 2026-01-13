<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\Classroom;
use App\Models\AcademicSession;
use App\Models\Term;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class FeeController extends Controller
{
    /**
     * Display a listing of fees
     */
    public function index(Request $request)
    {
        $query = Fee::with(['classroom', 'academicSession', 'term']);

        // Apply filters
        if ($request->filled('classroom_id')) {
            $query->where('classroom_id', $request->classroom_id);
        }

        if ($request->filled('session_id')) {
            $query->where('academic_session_id', $request->session_id);
        }

        if ($request->filled('term_id')) {
            $query->where('term_id', $request->term_id);
        }

        if ($request->filled('fee_type')) {
            $query->where('fee_type', $request->fee_type);
        }

        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $fees = $query->orderBy('created_at', 'desc')->paginate(15);

        // Get filter options
        $classrooms = Classroom::orderBy('name')->get(['id', 'name']);
        $academicSessions = AcademicSession::orderBy('start_date', 'desc')->get(['id', 'name']);
        $terms = Term::with('academicSession')->orderBy('created_at', 'desc')->get(['id', 'name', 'academic_session_id']);

        return Inertia::render('Admin/Fees/Index', [
            'fees' => $fees,
            'filters' => $request->only(['classroom_id', 'session_id', 'term_id', 'fee_type', 'status', 'search']),
            'classrooms' => $classrooms,
            'academicSessions' => $academicSessions,
            'terms' => $terms,
            'feeTypes' => Fee::getFeeTypes(),
            'paymentFrequencies' => Fee::getPaymentFrequencies(),
        ]);
    }

    /**
     * Show the form for creating a new fee
     */
    public function create()
    {
        return Inertia::render('Admin/Fees/Create', [
            'classrooms' => Classroom::orderBy('name')->get(),
            'academicSessions' => AcademicSession::orderByDesc('is_current')->orderByDesc('start_date')->get(),
            'terms' => Term::with('academicSession')->orderByDesc('is_current')->get(),
            'feeTypes' => Fee::getFeeTypes(),
            'paymentFrequencies' => Fee::getPaymentFrequencies(),
        ]);
    }

    /**
     * Store a newly created fee
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'amount' => 'required|numeric|min:0',
            'fee_type' => ['required', Rule::in(array_keys(Fee::getFeeTypes()))],
            'payment_frequency' => ['required', Rule::in(array_keys(Fee::getPaymentFrequencies()))],
            'classroom_id' => 'nullable|exists:classrooms,id',
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id' => 'nullable|exists:terms,id',
            'is_active' => 'boolean',
            'is_mandatory' => 'boolean',
            'allow_partial_payment' => 'boolean',
            'minimum_amount' => 'nullable|numeric|min:0',
            'due_date' => 'nullable|date|after:today',
            'late_fee_amount' => 'nullable|numeric|min:0',
            'grace_period_days' => 'nullable|integer|min:0|max:365',
        ]);

        $fee = Fee::create([
            'name' => $request->name,
            'description' => $request->description,
            'amount' => $request->amount,
            'fee_type' => $request->fee_type,
            'payment_frequency' => $request->payment_frequency,
            'classroom_id' => $request->classroom_id,
            'academic_session_id' => $request->academic_session_id,
            'term_id' => $request->term_id,
            'is_active' => $request->boolean('is_active', true),
            'is_mandatory' => $request->boolean('is_mandatory', true),
            'due_date' => $request->due_date,
            'late_fee_amount' => $request->late_fee_amount ?? 0,
            'grace_period_days' => $request->grace_period_days ?? 0,
        ]);

        return redirect()->route('admin.fees.index')
            ->with('success', 'Fee created successfully.');
    }

    /**
     * Display the specified fee
     */
    public function show(Fee $fee)
    {
        $fee->load(['classroom', 'academicSession', 'term']);
        
        // Get payment statistics for this fee
        $paymentStats = Payment::where('fee_id', $fee->id)
            ->selectRaw('
                COUNT(*) as total_payments,
                COUNT(CASE WHEN status = "successful" THEN 1 END) as successful_payments,
                COUNT(CASE WHEN status = "pending" THEN 1 END) as pending_payments,
                COUNT(CASE WHEN status = "failed" THEN 1 END) as failed_payments,
                SUM(CASE WHEN status = "successful" THEN amount ELSE 0 END) as total_collected
            ')
            ->first();

        // Get recent payments
        $recentPayments = Payment::where('fee_id', $fee->id)
            ->with(['student.user'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Admin/Fees/Show', [
            'fee' => $fee,
            'paymentStats' => $paymentStats,
            'recentPayments' => $recentPayments,
        ]);
    }

    /**
     * Show the form for editing the specified fee
     */
    public function edit(Fee $fee)
    {
        $fee->load(['classroom', 'academicSession', 'term']);
        
        return Inertia::render('Admin/Fees/Edit', [
            'fee' => $fee,
            'classrooms' => Classroom::orderBy('name')->get(),
            'academicSessions' => AcademicSession::orderByDesc('is_current')->orderByDesc('start_date')->get(),
            'terms' => Term::with('academicSession')->orderByDesc('is_current')->get(),
            'feeTypes' => Fee::getFeeTypes(),
            'paymentFrequencies' => Fee::getPaymentFrequencies(),
        ]);
    }

    /**
     * Update the specified fee
     */
    public function update(Request $request, Fee $fee)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'amount' => 'required|numeric|min:0',
            'fee_type' => ['required', Rule::in(array_keys(Fee::getFeeTypes()))],
            'payment_frequency' => ['required', Rule::in(array_keys(Fee::getPaymentFrequencies()))],
            'classroom_id' => 'nullable|exists:classrooms,id',
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id' => 'nullable|exists:terms,id',
            'is_active' => 'boolean',
            'is_mandatory' => 'boolean',
            'due_date' => 'nullable|date',
            'late_fee_amount' => 'nullable|numeric|min:0',
            'grace_period_days' => 'nullable|integer|min:0|max:365',
        ]);

        $fee->update([
            'name' => $request->name,
            'description' => $request->description,
            'amount' => $request->amount,
            'fee_type' => $request->fee_type,
            'payment_frequency' => $request->payment_frequency,
            'classroom_id' => $request->classroom_id,
            'academic_session_id' => $request->academic_session_id,
            'term_id' => $request->term_id,
            'is_active' => $request->boolean('is_active', true),
            'is_mandatory' => $request->boolean('is_mandatory', true),
            'due_date' => $request->due_date,
            'late_fee_amount' => $request->late_fee_amount ?? 0,
            'grace_period_days' => $request->grace_period_days ?? 0,
        ]);

        return redirect()->route('admin.fees.index')
            ->with('success', 'Fee updated successfully.');
    }

    /**
     * Remove the specified fee
     */
    public function destroy(Fee $fee)
    {
        // Check if there are any payments for this fee
        $paymentsCount = Payment::where('fee_id', $fee->id)->count();
        
        if ($paymentsCount > 0) {
            return back()->with('error', 
                'Cannot delete fee that has payment records. Consider deactivating it instead.');
        }

        $fee->delete();

        return redirect()->route('admin.fees.index')
            ->with('success', 'Fee deleted successfully.');
    }

    /**
     * Bulk update fee status
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'fee_ids' => 'required|array',
            'fee_ids.*' => 'exists:fees,id',
            'status' => 'required|boolean',
        ]);

        Fee::whereIn('id', $request->fee_ids)
            ->update(['is_active' => $request->status]);

        $action = $request->status ? 'activated' : 'deactivated';
        $count = count($request->fee_ids);

        return back()->with('success', 
            "{$count} fee(s) {$action} successfully.");
    }

    /**
     * Duplicate fee for new term/session
     */
    public function duplicate(Request $request, Fee $fee)
    {
        $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id' => 'nullable|exists:terms,id',
            'amount' => 'nullable|numeric|min:0',
            'due_date' => 'nullable|date|after:today',
        ]);

        $newFee = $fee->replicate();
        $newFee->academic_session_id = $request->academic_session_id;
        $newFee->term_id = $request->term_id;
        
        if ($request->filled('amount')) {
            $newFee->amount = $request->amount;
        }
        
        if ($request->filled('due_date')) {
            $newFee->due_date = $request->due_date;
        }
        
        $newFee->save();

        return redirect()->route('admin.fees.show', $newFee)
            ->with('success', 'Fee duplicated successfully.');
    }

    /**
     * Get fee collection summary
     */
    public function collectionSummary(Request $request)
    {
        $sessionId = $request->get('session_id');
        $termId = $request->get('term_id');
        $classroomId = $request->get('classroom_id');

        $query = Fee::with(['academicSession', 'term', 'classroom']);

        if ($sessionId) {
            $query->where('academic_session_id', $sessionId);
        }

        if ($termId) {
            $query->where('term_id', $termId);
        }

        if ($classroomId) {
            $query->where('classroom_id', $classroomId);
        }

        $fees = $query->active()->get();

        $summary = $fees->map(function ($fee) {
            $totalExpected = $fee->amount * ($fee->classroom ? 
                $fee->classroom->students()->count() : 
                \App\Models\Student::count());
            
            $totalCollected = Payment::where('fee_id', $fee->id)
                ->where('status', 'successful')
                ->sum('amount');

            return [
                'fee' => $fee,
                'total_expected' => $totalExpected,
                'total_collected' => $totalCollected,
                'outstanding' => $totalExpected - $totalCollected,
                'collection_rate' => $totalExpected > 0 ? 
                    round(($totalCollected / $totalExpected) * 100, 2) : 0,
            ];
        });

        return response()->json([
            'summary' => $summary,
            'totals' => [
                'expected' => $summary->sum('total_expected'),
                'collected' => $summary->sum('total_collected'),
                'outstanding' => $summary->sum('outstanding'),
                'overall_rate' => $summary->avg('collection_rate'),
            ]
        ]);
    }
}
