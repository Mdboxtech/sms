<?php

namespace App\Mail;

use App\Models\Student;
use App\Models\Fee;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OverduePaymentNotice extends Mailable
{
    use Queueable, SerializesModels;

    public $student;
    public $fee;
    public $daysOverdue;

    /**
     * Create a new message instance.
     */
    public function __construct(Student $student, Fee $fee, int $daysOverdue)
    {
        $this->student = $student;
        $this->fee = $fee;
        $this->daysOverdue = $daysOverdue;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Overdue Payment Notice - ' . $this->fee->name,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.overdue-payment-notice',
            with: [
                'student' => $this->student,
                'fee' => $this->fee,
                'daysOverdue' => $this->daysOverdue,
                'feeStatus' => $this->fee->getStatusForStudent($this->student->id),
                'lateFee' => $this->fee->getLateFeeAmount(),
                'gracePeriodEnded' => $this->daysOverdue > $this->fee->grace_period_days,
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
