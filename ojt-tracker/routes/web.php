<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DiaryController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Attendance
    Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::post('/attendance/am-time-in', [AttendanceController::class, 'amTimeIn'])->name('attendance.amTimeIn');
    Route::post('/attendance/am-time-out', [AttendanceController::class, 'amTimeOut'])->name('attendance.amTimeOut');
    Route::post('/attendance/pm-time-in', [AttendanceController::class, 'pmTimeIn'])->name('attendance.pmTimeIn');
    Route::post('/attendance/pm-time-out', [AttendanceController::class, 'pmTimeOut'])->name('attendance.pmTimeOut');
    Route::post('/attendance/redo', [AttendanceController::class, 'redo'])->name('attendance.redo');
    Route::post('/attendance/manual-entry', [AttendanceController::class, 'manualEntry'])->name('attendance.manualEntry');
    Route::put('/attendance/{attendance}', [AttendanceController::class, 'update'])->name('attendance.update');
    Route::delete('/attendance/{attendance}', [AttendanceController::class, 'destroy'])->name('attendance.destroy');
    Route::get('/attendance/history', [AttendanceController::class, 'history'])->name('attendance.history');

    // Diary
    Route::get('/diary', [DiaryController::class, 'index'])->name('diary.index');
    Route::post('/diary', [DiaryController::class, 'store'])->name('diary.store');
    Route::get('/diary/{date}', [DiaryController::class, 'show'])->name('diary.show');
    Route::put('/diary/{diary}', [DiaryController::class, 'update'])->name('diary.update');
    Route::delete('/diary/{diary}', [DiaryController::class, 'destroy'])->name('diary.destroy');
});

require __DIR__.'/auth.php';
