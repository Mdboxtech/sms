<?php

namespace App\Http\Controllers;

use App\Services\PaystackService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    protected $paystackService;

    public function __construct(PaystackService $paystackService)
    {
        $this->paystackService = $paystackService;
    }

    /**
     * Handle Paystack webhook
     */
    public function paystack(Request $request)
    {
        // Verify webhook signature
        if (!$this->verifyPaystackSignature($request)) {
            Log::warning('Invalid Paystack webhook signature', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
            
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        $payload = $request->all();
        
        Log::info('Paystack webhook received', [
            'event' => $payload['event'] ?? 'unknown',
            'data' => $payload['data'] ?? [],
        ]);

        try {
            $result = $this->paystackService->handleWebhook($payload);

            if ($result['status']) {
                return response()->json(['message' => 'Webhook processed successfully']);
            } else {
                Log::error('Webhook processing failed', [
                    'error' => $result['message'],
                    'payload' => $payload
                ]);
                
                return response()->json(['message' => 'Webhook processing failed'], 500);
            }

        } catch (\Exception $e) {
            Log::error('Webhook exception', [
                'message' => $e->getMessage(),
                'payload' => $payload,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['message' => 'Internal server error'], 500);
        }
    }

    /**
     * Verify Paystack webhook signature
     */
    private function verifyPaystackSignature(Request $request): bool
    {
        $signature = $request->header('x-paystack-signature');
        $secretKey = config('paystack.secretKey');

        if (!$signature || !$secretKey) {
            return false;
        }

        $computedSignature = hash_hmac('sha512', $request->getContent(), $secretKey);

        return hash_equals($signature, $computedSignature);
    }
}
