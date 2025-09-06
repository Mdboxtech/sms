<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'title', 'body', 'sender_id', 'sender_type', 'target_id', 'target_type', 'read_at', 'type', 'reference_id'
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    public function sender() {
        return $this->morphTo(null, 'sender_type', 'sender_id');
    }
    
    public function target() {
        return $this->morphTo(null, 'target_type', 'target_id');
    }

    public function markAsRead()
    {
        $this->update(['read_at' => now()]);
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('target_id', $userId)->where('target_type', 'App\Models\User');
    }
}
