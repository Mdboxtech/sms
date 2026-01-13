<?php

namespace App\Mail;

use App\Models\Student;
use App\Models\Fee;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentReminder extends Mailable
{
    use Queueable, SerializesModels;

    public $student;
    public $fee;
    public $daysUntilDue;

    /**
     * Create a new message instance.
     */
    public function __construct(Student $student, Fee $fee, int $daysUntilDue)
    {
        $this->student = $student;
        $this->fee = $fee;
        $this->daysUntilDue = $daysUntilDue;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Payment Reminder - ' . $this->fee->name,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.payment-reminder',
            with: [
                'student' => $this->student,
                'fee' => $this->fee,
                'daysUntilDue' => $this->daysUntilDue,
                'feeStatus' => $this->fee->getStatusForStudent($this->student->id),
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
