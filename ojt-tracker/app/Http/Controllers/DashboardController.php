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

        // Summary stats
        $totalHours = Attendance::where('user_id', $user->id)
            ->sum('total_hours');

        $daysCompleted = Attendance::where('user_id', $user->id)
            ->where(function ($q) {
                $q->whereNotNull('am_time_out')->orWhereNotNull('pm_time_out');
            })
            ->count();

        $daysPresent = Attendance::where('user_id', $user->id)
            ->where('status', 'present')
            ->count();

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
            'todayAttendance' => $todayAttendance,
            'totalHours' => (float) $totalHours,
            'daysCompleted' => $daysCompleted,
            'daysPresent' => $daysPresent,
            'recentAttendance' => $recentAttendance,
            'recentDiaries' => $recentDiaries,
        ]);
    }
}
