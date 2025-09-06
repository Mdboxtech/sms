<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'event_date',
        'event_time',
        'type',
        'created_by',
        'is_active',
        'all_day',
        'location',
        'color'
    ];

    protected $casts = [
        'event_date' => 'date',
        'is_active' => 'boolean',
        'all_day' => 'boolean'
    ];

    protected $dates = [
        'event_date'
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('event_date', [$startDate, $endDate]);
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }
}
