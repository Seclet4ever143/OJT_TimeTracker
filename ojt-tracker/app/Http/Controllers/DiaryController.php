<?php

namespace App\Http\Controllers;

use App\Models\DiaryEntry;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DiaryController extends Controller
{
    /**
     * Display diary page with calendar view.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $entries = DiaryEntry::where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->get();

        return Inertia::render('Diary/Index', [
            'entries' => $entries,
        ]);
    }

    /**
     * Store a new diary entry.
     */
    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'mood' => 'required|in:happy,neutral,tired,stressed,productive',
        ]);

        $user = $request->user();

        // Upsert — update if exists for that date, otherwise create
        DiaryEntry::updateOrCreate(
            [
                'user_id' => $user->id,
                'date' => $request->date,
            ],
            [
                'title' => $request->title,
                'content' => $request->content,
                'mood' => $request->mood,
            ]
        );

        return back()->with('success', 'Diary entry saved!');
    }

    /**
     * Show a single diary entry.
     */
    public function show(Request $request, string $date)
    {
        $user = $request->user();

        $entry = DiaryEntry::where('user_id', $user->id)
            ->where('date', $date)
            ->first();

        return Inertia::render('Diary/Show', [
            'entry' => $entry,
            'date' => $date,
        ]);
    }

    /**
     * Update an existing diary entry.
     */
    public function update(Request $request, DiaryEntry $diary)
    {
        if ($diary->user_id !== $request->user()->id) {
            abort(403);
        }

        $request->validate([
            'date' => 'required|date',
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'mood' => 'required|in:happy,neutral,tired,stressed,productive',
        ]);

        $diary->update([
            'date' => $request->date,
            'title' => $request->title,
            'content' => $request->content,
            'mood' => $request->mood,
        ]);

        return back()->with('success', 'Diary entry updated!');
    }

    /**
     * Delete a diary entry.
     */
    public function destroy(Request $request, DiaryEntry $diary)
    {
        if ($diary->user_id !== $request->user()->id) {
            abort(403);
        }

        $diary->delete();

        return back()->with('success', 'Diary entry deleted.');
    }
}
