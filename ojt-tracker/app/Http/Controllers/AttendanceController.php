<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    /**
     * Time In / Time Out page.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today();

        $todayAttendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        return Inertia::render('Attendance/TimeInOut', [
            'todayAttendance' => $todayAttendance,
        ]);
    }

    /* ------------------------------------------------------------------ */
    /*  AM Session                                                        */
    /* ------------------------------------------------------------------ */

    public function amTimeIn(Request $request)
    {
        $request->validate(['custom_time' => 'nullable|date_format:H:i']);

        $user = $request->user();
        $today = Carbon::today();
        $time  = $request->input('custom_time')
            ? Carbon::parse($today->format('Y-m-d') . ' ' . $request->input('custom_time'))
            : Carbon::now();

        $attendance = Attendance::firstOrCreate(
            ['user_id' => $user->id, 'date' => $today],
            ['status' => $time->hour >= 9 ? 'late' : 'present']
        );

        if ($attendance->am_time_in && !$request->input('custom_time')) {
            return back()->with('error', 'You have already timed in for the morning.');
        }

        $attendance->update(['am_time_in' => $time]);
        if ($attendance->am_time_out) {
            $attendance->recalculateHours();
        }

        return back()->with('success', 'Morning time-in recorded!');
    }

    public function amTimeOut(Request $request)
    {
        $request->validate(['custom_time' => 'nullable|date_format:H:i']);

        $user = $request->user();
        $today = Carbon::today();
        $time  = $request->input('custom_time')
            ? Carbon::parse($today->format('Y-m-d') . ' ' . $request->input('custom_time'))
            : Carbon::now();

        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        if (!$attendance || !$attendance->am_time_in) {
            return back()->with('error', 'You have not timed in for the morning.');
        }
        if ($attendance->am_time_out && !$request->input('custom_time')) {
            return back()->with('error', 'You have already timed out for the morning.');
        }

        $attendance->update(['am_time_out' => $time]);
        $attendance->recalculateHours();

        return back()->with('success', 'Morning time-out recorded!');
    }

    /* ------------------------------------------------------------------ */
    /*  PM Session                                                        */
    /* ------------------------------------------------------------------ */

    public function pmTimeIn(Request $request)
    {
        $request->validate(['custom_time' => 'nullable|date_format:H:i']);

        $user = $request->user();
        $today = Carbon::today();
        $time  = $request->input('custom_time')
            ? Carbon::parse($today->format('Y-m-d') . ' ' . $request->input('custom_time'))
            : Carbon::now();

        $attendance = Attendance::firstOrCreate(
            ['user_id' => $user->id, 'date' => $today],
            ['status' => 'present']
        );

        if ($attendance->pm_time_in && !$request->input('custom_time')) {
            return back()->with('error', 'You have already timed in for the afternoon.');
        }

        $attendance->update(['pm_time_in' => $time]);
        if ($attendance->pm_time_out) {
            $attendance->recalculateHours();
        }

        return back()->with('success', 'Afternoon time-in recorded!');
    }

    public function pmTimeOut(Request $request)
    {
        $request->validate(['custom_time' => 'nullable|date_format:H:i']);

        $user = $request->user();
        $today = Carbon::today();
        $time  = $request->input('custom_time')
            ? Carbon::parse($today->format('Y-m-d') . ' ' . $request->input('custom_time'))
            : Carbon::now();

        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        if (!$attendance || !$attendance->pm_time_in) {
            return back()->with('error', 'You have not timed in for the afternoon.');
        }
        if ($attendance->pm_time_out && !$request->input('custom_time')) {
            return back()->with('error', 'You have already timed out for the afternoon.');
        }

        $attendance->update(['pm_time_out' => $time]);
        $attendance->recalculateHours();

        return back()->with('success', 'Afternoon time-out recorded!');
    }

    /* ------------------------------------------------------------------ */
    /*  Redo / Reset a session                                            */
    /* ------------------------------------------------------------------ */

    public function redo(Request $request)
    {
        $request->validate([
            'session' => 'required|in:am,pm',
        ]);

        $user = $request->user();
        $today = Carbon::today();
        $session = $request->input('session'); // 'am' or 'pm'

        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        if (!$attendance) {
            return back()->with('error', 'No attendance record to reset.');
        }

        if ($session === 'am') {
            $attendance->update([
                'am_time_in'  => null,
                'am_time_out' => null,
                'am_total_hours' => null,
            ]);
        } else {
            $attendance->update([
                'pm_time_in'  => null,
                'pm_time_out' => null,
                'pm_total_hours' => null,
            ]);
        }

        $attendance->recalculateHours();

        $label = $session === 'am' ? 'Morning' : 'Afternoon';
        return back()->with('success', "{$label} session has been reset. You can time in again.");
    }

    /* ------------------------------------------------------------------ */
    /*  Manual Entry (for past dates)                                     */
    /* ------------------------------------------------------------------ */

    public function manualEntry(Request $request)
    {
        $request->validate([
            'date'        => 'required|date|before_or_equal:today',
            'am_time_in'  => 'nullable|date_format:H:i',
            'am_time_out' => 'nullable|date_format:H:i|required_with:am_time_in',
            'pm_time_in'  => 'nullable|date_format:H:i',
            'pm_time_out' => 'nullable|date_format:H:i|required_with:pm_time_in',
        ]);

        $user = $request->user();
        $date = Carbon::parse($request->input('date'));

        // Build timestamp helpers
        $makeTimestamp = fn(?string $time) => $time
            ? Carbon::parse($date->format('Y-m-d') . ' ' . $time)
            : null;

        $amIn  = $makeTimestamp($request->input('am_time_in'));
        $amOut = $makeTimestamp($request->input('am_time_out'));
        $pmIn  = $makeTimestamp($request->input('pm_time_in'));
        $pmOut = $makeTimestamp($request->input('pm_time_out'));

        // Validate logical order
        if ($amIn && $amOut && $amOut->lte($amIn)) {
            return back()->with('error', 'AM time-out must be after AM time-in.');
        }
        if ($pmIn && $pmOut && $pmOut->lte($pmIn)) {
            return back()->with('error', 'PM time-out must be after PM time-in.');
        }

        $amHours = ($amIn && $amOut) ? round($amIn->diffInMinutes($amOut) / 60, 2) : null;
        $pmHours = ($pmIn && $pmOut) ? round($pmIn->diffInMinutes($pmOut) / 60, 2) : null;
        $total   = round(($amHours ?? 0) + ($pmHours ?? 0), 2) ?: null;

        Attendance::updateOrCreate(
            ['user_id' => $user->id, 'date' => $date],
            [
                'am_time_in'     => $amIn,
                'am_time_out'    => $amOut,
                'am_total_hours' => $amHours,
                'pm_time_in'     => $pmIn,
                'pm_time_out'    => $pmOut,
                'pm_total_hours' => $pmHours,
                'total_hours'    => $total,
                'status'         => 'present',
                'is_manual'      => true,
            ]
        );

        return back()->with('success', 'Manual attendance entry saved!');
    }

    /* ------------------------------------------------------------------ */
    /*  Update an existing attendance record                               */
    /* ------------------------------------------------------------------ */

    public function update(Request $request, Attendance $attendance)
    {
        // Ensure the user owns this record
        if ($attendance->user_id !== $request->user()->id) {
            return back()->with('error', 'Unauthorized.');
        }

        $request->validate([
            'date'        => 'required|date|before_or_equal:today',
            'am_time_in'  => 'nullable|date_format:H:i',
            'am_time_out' => 'nullable|date_format:H:i',
            'pm_time_in'  => 'nullable|date_format:H:i',
            'pm_time_out' => 'nullable|date_format:H:i',
        ]);

        $date = Carbon::parse($request->input('date'));

        $makeTimestamp = fn(?string $time) => $time
            ? Carbon::parse($date->format('Y-m-d') . ' ' . $time)
            : null;

        $amIn  = $makeTimestamp($request->input('am_time_in'));
        $amOut = $makeTimestamp($request->input('am_time_out'));
        $pmIn  = $makeTimestamp($request->input('pm_time_in'));
        $pmOut = $makeTimestamp($request->input('pm_time_out'));

        if ($amIn && $amOut && $amOut->lte($amIn)) {
            return back()->with('error', 'AM time-out must be after AM time-in.');
        }
        if ($pmIn && $pmOut && $pmOut->lte($pmIn)) {
            return back()->with('error', 'PM time-out must be after PM time-in.');
        }

        $amHours = ($amIn && $amOut) ? round($amIn->diffInMinutes($amOut) / 60, 2) : null;
        $pmHours = ($pmIn && $pmOut) ? round($pmIn->diffInMinutes($pmOut) / 60, 2) : null;
        $total   = round(($amHours ?? 0) + ($pmHours ?? 0), 2) ?: null;

        $attendance->update([
            'date'           => $date,
            'am_time_in'     => $amIn,
            'am_time_out'    => $amOut,
            'am_total_hours' => $amHours,
            'pm_time_in'     => $pmIn,
            'pm_time_out'    => $pmOut,
            'pm_total_hours' => $pmHours,
            'total_hours'    => $total,
        ]);

        return back()->with('success', 'Attendance record updated!');
    }

    /* ------------------------------------------------------------------ */
    /*  Delete Attendance                                                  */
    /* ------------------------------------------------------------------ */

    public function destroy(Request $request, Attendance $attendance)
    {
        if ($attendance->user_id !== $request->user()->id) {
            abort(403);
        }

        $attendance->delete();

        return back()->with('success', 'Attendance record deleted.');
    }

    /* ------------------------------------------------------------------ */
    /*  Attendance History                                                 */
    /* ------------------------------------------------------------------ */

    public function history(Request $request)
    {
        $user = $request->user();

        $attendances = Attendance::where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->paginate(15);

        $totalHours = (float) Attendance::where('user_id', $user->id)->sum('total_hours');
        $daysCompleted = Attendance::where('user_id', $user->id)
            ->where(function ($q) {
                $q->whereNotNull('am_time_out')->orWhereNotNull('pm_time_out');
            })
            ->count();

        return Inertia::render('Attendance/History', [
            'attendances'   => $attendances,
            'totalHours'    => $totalHours,
            'daysCompleted' => $daysCompleted,
        ]);
    }
}
