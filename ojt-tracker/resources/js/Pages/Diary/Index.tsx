import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { DiaryEntry } from '@/types';
import { useState, useMemo } from 'react';

interface Props {
    entries: DiaryEntry[];
}

const moods = [
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'productive', emoji: '🚀', label: 'Productive' },
    { value: 'tired', emoji: '😴', label: 'Tired' },
    { value: 'stressed', emoji: '😰', label: 'Stressed' },
] as const;

/* ------------------------------------------------------------------ */
/*  Edit Modal for Diary History                                      */
/* ------------------------------------------------------------------ */
function DiaryEditModal({ entry, onClose }: { entry: DiaryEntry; onClose: () => void }) {
    const form = useForm({
        date: entry.date.substring(0, 10),
        title: entry.title || '',
        content: entry.content || '',
        mood: entry.mood || 'neutral',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(route('diary.update', entry.id), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Diary Entry</h3>
                    <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {/* Date */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            value={form.data.date}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => form.setData('date', e.target.value)}
                            required
                            className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    {/* Title */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            value={form.data.title}
                            onChange={(e) => form.setData('title', e.target.value)}
                            className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    {/* Mood */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Mood</label>
                        <div className="flex flex-wrap gap-2">
                            {moods.map((m) => (
                                <button
                                    key={m.value}
                                    type="button"
                                    onClick={() => form.setData('mood', m.value)}
                                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
                                        form.data.mood === m.value
                                            ? 'border-blue-300 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <span>{m.emoji}</span>
                                    <span>{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Content</label>
                        <textarea
                            value={form.data.content}
                            onChange={(e) => form.setData('content', e.target.value)}
                            rows={6}
                            className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-40"
                        >
                            {form.processing ? 'Saving…' : 'Update'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function DiaryIndex({ entries }: Props) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState<string>(
        formatDateKey(today.getFullYear(), today.getMonth(), today.getDate())
    );
    const [showEditor, setShowEditor] = useState(false);
    const [editingDiary, setEditingDiary] = useState<DiaryEntry | null>(null);

    // Index entries by date
    const entryMap = useMemo(() => {
        const map: Record<string, DiaryEntry> = {};
        entries.forEach((e) => {
            const key = e.date.substring(0, 10);
            map[key] = e;
        });
        return map;
    }, [entries]);

    const selectedEntry = entryMap[selectedDate] || null;

    const { data, setData, post, processing, errors, reset } = useForm({
        date: selectedDate,
        title: selectedEntry?.title || '',
        content: selectedEntry?.content || '',
        mood: (selectedEntry?.mood || 'neutral') as string,
    });

    // When selectedDate changes, update form
    const handleSelectDate = (dateKey: string) => {
        setSelectedDate(dateKey);
        const entry = entryMap[dateKey];
        setData({
            date: dateKey,
            title: entry?.title || '',
            content: entry?.content || '',
            mood: entry?.mood || 'neutral',
        });
        setShowEditor(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('diary.store'), {
            preserveScroll: true,
            onSuccess: () => {
                // Keep editor open after save
            },
        });
    };

    // Calendar data
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const monthName = new Date(currentYear, currentMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

    return (
        <AppLayout header="Daily Diary">
            <Head title="Daily Diary" />

            <div className="grid gap-6 lg:grid-cols-5">
                {/* Calendar — left side */}
                <div className="lg:col-span-2">
                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm shadow-gray-100">
                        {/* Month navigation */}
                        <div className="mb-4 flex items-center justify-between">
                            <button
                                onClick={prevMonth}
                                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                </svg>
                            </button>
                            <h3 className="text-sm font-semibold text-gray-900">{monthName}</h3>
                            <button
                                onClick={nextMonth}
                                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>
                        </div>

                        {/* Day headers */}
                        <div className="mb-2 grid grid-cols-7 text-center text-xs font-medium text-gray-400">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                                <div key={d} className="py-1">{d}</div>
                            ))}
                        </div>

                        {/* Days grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {/* Empty spaces for first day offset */}
                            {Array.from({ length: firstDay }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}

                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dateKey = formatDateKey(currentYear, currentMonth, day);
                                const hasEntry = !!entryMap[dateKey];
                                const isSelected = dateKey === selectedDate;
                                const isToday = dateKey === todayKey;

                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleSelectDate(dateKey)}
                                        className={`relative flex h-10 w-full items-center justify-center rounded-lg text-sm transition ${
                                            isSelected
                                                ? 'bg-blue-600 font-semibold text-white'
                                                : isToday
                                                ? 'bg-blue-50 font-semibold text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {day}
                                        {hasEntry && !isSelected && (
                                            <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-blue-400" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="mt-3 flex items-center gap-4 px-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-blue-400" /> Has entry
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-blue-600" /> Selected
                        </span>
                    </div>
                </div>

                {/* Editor — right side */}
                <div className="lg:col-span-3">
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-100">
                        {showEditor || selectedEntry ? (
                            <>
                                <div className="mb-5 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900">
                                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </h3>
                                    {selectedEntry && (
                                        <span className="text-lg">{moods.find((m) => m.value === selectedEntry.mood)?.emoji}</span>
                                    )}
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Title</label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="What did you work on today?"
                                            className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                                    </div>

                                    {/* Mood Selector */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">How are you feeling?</label>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {moods.map((mood) => (
                                                <button
                                                    key={mood.value}
                                                    type="button"
                                                    onClick={() => setData('mood', mood.value)}
                                                    className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition ${
                                                        data.mood === mood.value
                                                            ? 'border-blue-300 bg-blue-50 text-blue-700'
                                                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <span>{mood.emoji}</span>
                                                    <span>{mood.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                        {errors.mood && <p className="mt-1 text-xs text-red-500">{errors.mood}</p>}
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Diary Entry</label>
                                        <textarea
                                            value={data.content}
                                            onChange={(e) => setData('content', e.target.value)}
                                            rows={8}
                                            placeholder="Write about your day — tasks, learnings, challenges…"
                                            className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>

                                    {/* Save */}
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                                        >
                                            {processing ? 'Saving…' : selectedEntry ? 'Update Entry' : 'Save Entry'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                                    📖
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Select a date</h3>
                                <p className="mt-1 max-w-xs text-sm text-gray-500">
                                    Click on any date in the calendar to view or write a diary entry for that day.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Diary History — Card Style */}
            <div className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Diary History</h3>
                        <p className="mt-0.5 text-sm text-gray-500">All your diary entries</p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                    </span>
                </div>

                {entries.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-2xl">📝</div>
                        <p className="text-sm font-medium text-gray-500">No diary entries yet</p>
                        <p className="mt-1 text-xs text-gray-400">Select a date above to write your first entry.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {entries.map((entry) => {
                            const moodData = moods.find((m) => m.value === entry.mood);
                            const dateStr = new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {
                                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                            });

                            return (
                                <div
                                    key={entry.id}
                                    className="group relative flex flex-col rounded-xl border border-gray-100 bg-white shadow-sm shadow-gray-100 transition hover:border-blue-100 hover:shadow-md"
                                >
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between border-b border-gray-50 px-5 py-4">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-gray-400">{dateStr}</p>
                                            <h4 className="mt-1 truncate text-sm font-semibold text-gray-900">
                                                {entry.title || 'Untitled'}
                                            </h4>
                                        </div>
                                        {moodData && (
                                            <span className="ml-3 flex-shrink-0 text-2xl" title={moodData.label}>
                                                {moodData.emoji}
                                            </span>
                                        )}
                                    </div>

                                    {/* Card Body */}
                                    <div className="flex-1 px-5 py-3">
                                        <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
                                            {entry.content || 'No content written.'}
                                        </p>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="flex items-center justify-between border-t border-gray-50 px-5 py-3">
                                        {moodData ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                                                <span>{moodData.emoji}</span> {moodData.label}
                                            </span>
                                        ) : (
                                            <span />
                                        )}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setEditingDiary(entry)}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 active:bg-blue-200"
                                            >
                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                                                </svg>
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete this diary entry?')) {
                                                        router.delete(route('diary.destroy', entry.id), { preserveScroll: true });
                                                    }
                                                }}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 active:bg-red-200"
                                            >
                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {editingDiary && <DiaryEditModal entry={editingDiary} onClose={() => setEditingDiary(null)} />}
        </AppLayout>
    );
}
