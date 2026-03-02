<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\DiaryEntry;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today();

        // Today's attendance
        $todayAttendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        // Calculate rendered hours (clamped to 8am-12pm & 1pm-5pm) and excess hours
        $allAttendances = Attendance::where('user_id', $user->id)->get();

        $renderedHours = 0;
        $totalRawHours = 0;

        foreach ($allAttendances as $a) {
            $totalRawHours += (float) ($a->total_hours ?? 0);

            // AM session: clamp to 8:00-12:00
            if ($a->am_time_in && $a->am_time_out) {
                $date = $a->date->format('Y-m-d');
                $amStart = max($a->am_time_in->timestamp, Carbon::parse("$date 08:00:00")->timestamp);
                $amEnd   = min($a->am_time_out->timestamp, Carbon::parse("$date 12:00:00")->timestamp);
                if ($amEnd > $amStart) {
                    $renderedHours += ($amEnd - $amStart) / 3600;
                }
            }

            // PM session: clamp to 13:00-17:00
            if ($a->pm_time_in && $a->pm_time_out) {
                $date = $a->date->format('Y-m-d');
                $pmStart = max($a->pm_time_in->timestamp, Carbon::parse("$date 13:00:00")->timestamp);
                $pmEnd   = min($a->pm_time_out->timestamp, Carbon::parse("$date 17:00:00")->timestamp);
                if ($pmEnd > $pmStart) {
                    $renderedHours += ($pmEnd - $pmStart) / 3600;
                }
            }
        }

        $renderedHours = round($renderedHours, 2);
        $excessHours   = round(max($totalRawHours - $renderedHours, 0), 2);
        $requiredHours = (float) $user->required_hours;
        $remainingHours = round(max($requiredHours - $renderedHours, 0), 2);
        $completionPercent = $requiredHours > 0
            ? round(min(($renderedHours / $requiredHours) * 100, 100), 1)
            : 100;

        $daysCompleted = $allAttendances->filter(function ($a) {
            return $a->am_time_out || $a->pm_time_out;
        })->count();

        $daysPresent = $allAttendances->where('status', 'present')->count();

        // Recent attendance (last 5)
        $recentAttendance = Attendance::where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->limit(5)
            ->get();

        // Recent diary entries (last 3)
        $recentDiaries = DiaryEntry::where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->limit(3)
            ->get();

        return Inertia::render('Dashboard', [
            'todayAttendance'  => $todayAttendance,
            'renderedHours'    => $renderedHours,
            'excessHours'      => $excessHours,
            'requiredHours'    => $requiredHours,
            'remainingHours'   => $remainingHours,
            'completionPercent' => $completionPercent,
            'daysCompleted'    => $daysCompleted,
            'daysPresent'      => $daysPresent,
            'recentAttendance' => $recentAttendance,
            'recentDiaries'    => $recentDiaries,
        ]);
    }

    /**
     * Update the user's required hours.
     */
    public function updateRequiredHours(Request $request)
    {
        $request->validate([
            'required_hours' => 'required|numeric|min:1|max:9999',
        ]);

        $request->user()->update([
            'required_hours' => $request->input('required_hours'),
        ]);

        return back()->with('success', 'Required hours updated!');
    }
}
