<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;
    
    const STATUS_PENDING = 'pending';
    const STATUS_SENT = 'sent';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_FAILED = 'failed';
    
    protected $fillable = [
        'sender_id', 'sender_type', 'receiver_id', 'receiver_type', 'subject', 'body', 
        'attachment_path', 'attachment_type', 'read_at', 'status', 'sent_at', 'delivered_at'
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function sender() {
        return $this->morphTo(null, 'sender_type', 'sender_id');
    }

    public function receiver() {
        return $this->morphTo(null, 'receiver_type', 'receiver_id');
    }

    public function markAsSent()
    {
        $this->update([
            'status' => self::STATUS_SENT,
            'sent_at' => now()
        ]);
    }

    public function markAsDelivered()
    {
        $this->update([
            'status' => self::STATUS_DELIVERED,
            'delivered_at' => now()
        ]);
    }

    public function markAsFailed()
    {
        $this->update(['status' => self::STATUS_FAILED]);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}
