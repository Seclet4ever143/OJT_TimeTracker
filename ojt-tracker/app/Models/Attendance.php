<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'am_time_in',
        'am_time_out',
        'am_total_hours',
        'pm_time_in',
        'pm_time_out',
        'pm_total_hours',
        'total_hours',
        'status',
        'is_manual',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'am_time_in' => 'datetime',
        'am_time_out' => 'datetime',
        'am_total_hours' => 'decimal:2',
        'pm_time_in' => 'datetime',
        'pm_time_out' => 'datetime',
        'pm_total_hours' => 'decimal:2',
        'total_hours' => 'decimal:2',
        'is_manual' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Recalculate session & total hours.
     */
    public function recalculateHours(): void
    {
        $amHours = null;
        if ($this->am_time_in && $this->am_time_out) {
            $amHours = round($this->am_time_in->diffInMinutes($this->am_time_out) / 60, 2);
        }

        $pmHours = null;
        if ($this->pm_time_in && $this->pm_time_out) {
            $pmHours = round($this->pm_time_in->diffInMinutes($this->pm_time_out) / 60, 2);
        }

        $this->am_total_hours = $amHours;
        $this->pm_total_hours = $pmHours;
        $this->total_hours = round(($amHours ?? 0) + ($pmHours ?? 0), 2) ?: null;
        $this->save();
    }
}
