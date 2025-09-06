<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MessageController extends Controller
{
    /**
     * Display inbox messages
     */
    public function inbox(Request $request)
    {
        $user = Auth::user();
        
        $messages = Message::where('receiver_id', $user->id)
                           ->where('receiver_type', get_class($user))
                           ->with(['sender'])
                           ->orderBy('created_at', 'desc')
                           ->paginate(20);

        return Inertia::render('Messages/Inbox', [
            'messages' => $messages,
            'unreadCount' => $this->getUnreadMessagesCount()
        ]);
    }

    /**
     * Display sent messages
     */
    public function sent(Request $request)
    {
        $user = Auth::user();
        
        $messages = Message::where('sender_id', $user->id)
                           ->where('sender_type', get_class($user))
                           ->with(['receiver'])
                           ->orderBy('created_at', 'desc')
                           ->paginate(20);

        return Inertia::render('Messages/Sent', [
            'messages' => $messages
        ]);
    }

    /**
     * Show the form for creating a new message
     */
    public function create()
    {
        $students = Student::with('user')->get();
        $teachers = Teacher::with('user')->get();

        return Inertia::render('Messages/Create', [
            'students' => $students,
            'teachers' => $teachers
        ]);
    }

    /**
     * Store a newly created message
     */
    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|integer',
            'receiver_type' => 'required|in:student,teacher,admin',
            'subject' => 'required|string|max:255',
            'body' => 'nullable|string',
            'attachment' => 'nullable|file|max:10240' // 10MB max
        ]);

        $user = Auth::user();
        $attachmentPath = null;
        $attachmentType = null;

        // Handle file upload
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachmentPath = $file->store('message_attachments', 'public');
            $attachmentType = $file->getClientOriginalExtension();
        }

        // Determine receiver model type
        $receiverModelType = $this->getModelTypeFromString($request->receiver_type);

        try {
            $message = Message::create([
                'sender_id' => $user->id,
                'sender_type' => get_class($user),
                'receiver_id' => $request->receiver_id,
                'receiver_type' => $receiverModelType,
                'subject' => $request->subject,
                'body' => $request->body,
                'attachment_path' => $attachmentPath,
                'attachment_type' => $attachmentType,
                'status' => Message::STATUS_PENDING,
            ]);

            // Mark as sent (simulating successful delivery)
            $message->markAsSent();
            $message->markAsDelivered();

            return redirect()->route('messages.sent')
                            ->with('success', 'Message sent successfully!');
        } catch (\Exception $e) {
            // If message creation fails, mark as failed
            if (isset($message)) {
                $message->markAsFailed();
            }
            
            return redirect()->back()
                            ->with('error', 'Failed to send message: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified message
     */
    public function show(Message $message)
    {
        $user = Auth::user();
        
        // Check if user can view this message
        if (!$this->canUserViewMessage($user, $message)) {
            abort(403, 'Unauthorized');
        }

        // Mark as read if user is the receiver and message is unread
        if ($message->receiver_id === $user->id && 
            $message->receiver_type === get_class($user) && 
            !$message->read_at) {
            $message->update(['read_at' => now()]);
        }

        return Inertia::render('Messages/Show', [
            'message' => $message->load(['sender', 'receiver'])
        ]);
    }

    /**
     * Download message attachment
     */
    public function downloadAttachment(Message $message)
    {
        $user = Auth::user();
        
        if (!$this->canUserViewMessage($user, $message)) {
            abort(403, 'Unauthorized');
        }

        if (!$message->attachment_path || !Storage::disk('public')->exists($message->attachment_path)) {
            abort(404, 'Attachment not found');
        }

        $filePath = Storage::disk('public')->path($message->attachment_path);
        $fileName = basename($message->attachment_path);
        
        return response()->download($filePath, $fileName);
    }

    /**
     * Mark message as read
     */
    public function markAsRead(Message $message)
    {
        $user = Auth::user();
        
        if ($message->receiver_id === $user->id && 
            $message->receiver_type === get_class($user)) {
            $message->update(['read_at' => now()]);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Delete message
     */
    public function destroy(Message $message)
    {
        $user = Auth::user();
        
        // Only sender or receiver can delete
        if (!$this->canUserViewMessage($user, $message)) {
            abort(403, 'Unauthorized');
        }

        // Delete attachment if exists
        if ($message->attachment_path && Storage::disk('public')->exists($message->attachment_path)) {
            Storage::disk('public')->delete($message->attachment_path);
        }

        $message->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Send message to multiple recipients
     */
    public function sendBulk(Request $request)
    {
        $request->validate([
            'receiver_ids' => 'required|array',
            'receiver_type' => 'required|in:student,teacher,admin',
            'subject' => 'required|string|max:255',
            'body' => 'nullable|string',
            'attachment' => 'nullable|file|max:10240'
        ]);

        $user = Auth::user();
        $attachmentPath = null;
        $attachmentType = null;

        // Handle file upload
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachmentPath = $file->store('message_attachments', 'public');
            $attachmentType = $file->getClientOriginalExtension();
        }

        $receiverModelType = $this->getModelTypeFromString($request->receiver_type);

        // Send message to each recipient
        foreach ($request->receiver_ids as $receiverId) {
            Message::create([
                'sender_id' => $user->id,
                'sender_type' => get_class($user),
                'receiver_id' => $receiverId,
                'receiver_type' => $receiverModelType,
                'subject' => $request->subject,
                'body' => $request->body,
                'attachment_path' => $attachmentPath,
                'attachment_type' => $attachmentType,
            ]);
        }

        return redirect()->route('admin.messages.sent')
                        ->with('success', 'Messages sent successfully to ' . count($request->receiver_ids) . ' recipients!');
    }

    /**
     * Get unread messages count
     */
    private function getUnreadMessagesCount()
    {
        $user = Auth::user();
        
        return Message::where('receiver_id', $user->id)
                      ->where('receiver_type', get_class($user))
                      ->whereNull('read_at')
                      ->count();
    }

    /**
     * Get unread messages count for API
     */
    public function getUnreadCount()
    {
        $user = Auth::user();
        $count = Message::where('receiver_id', $user->id)
                        ->where('receiver_type', get_class($user))
                        ->whereNull('read_at')
                        ->count();
        
        return response()->json(['count' => $count]);
    }

    /**
     * Check if user can view message
     */
    private function canUserViewMessage($user, $message)
    {
        return ($message->sender_id === $user->id && $message->sender_type === get_class($user)) ||
               ($message->receiver_id === $user->id && $message->receiver_type === get_class($user));
    }

    /**
     * Convert string to model type
     */
    private function getModelTypeFromString($type)
    {
        switch ($type) {
            case 'student':
                return 'App\Models\User';
            case 'teacher':
                return 'App\Models\User';
            case 'admin':
                return 'App\Models\User';
            default:
                return 'App\Models\User';
        }
    }
}
