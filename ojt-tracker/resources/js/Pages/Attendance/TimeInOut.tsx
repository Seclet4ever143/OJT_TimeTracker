import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Attendance } from '@/types';
import { useEffect, useMemo, useState } from 'react';

interface Props {
    todayAttendance: Attendance | null;
    attendances: Attendance[];
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

/* ------------------------------------------------------------------ */
/*  Live Clock                                                        */
/* ------------------------------------------------------------------ */
function LiveClock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="text-center">
            <p className="text-5xl font-bold tabular-nums tracking-tight text-gray-900 sm:text-6xl">
                {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="mt-2 text-sm text-gray-500">
                {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Helper: format a timestamp string for display                     */
/* ------------------------------------------------------------------ */
function formatTime(ts: string | null) {
    if (!ts) return '—';
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Manila' });
}

/* ------------------------------------------------------------------ */
/*  Inline Time Row (Time In or Time Out with edit / update)          */
/* ------------------------------------------------------------------ */
function TimeRow({
    label,
    value,
    onRecord,
    disabled,
    autoDisabled,
    processing,
    buttonLabel,
    buttonColor,
}: {
    label: string;
    value: string | null;
    onRecord: (customTime?: string) => void;
    disabled: boolean;
    autoDisabled: boolean;
    processing: boolean;
    buttonLabel: string;
    buttonColor: 'blue' | 'red';
}) {
    const [editing, setEditing] = useState(false);
    const [customTime, setCustomTime] = useState('');
    const hasValue = !!value;

    const btnBase = buttonColor === 'blue'
        ? 'bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700 disabled:shadow-none'
        : 'border-2 border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100';

    return (
        <div className="rounded-lg bg-gray-50 px-4 py-3">
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-medium text-gray-900">{formatTime(value)}</span>
            </div>

            {/* Edit row — shows time input */}
            {editing && (
                <div className="mt-2 flex items-end gap-2">
                    <input
                        type="time"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="block w-full rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <button
                        onClick={() => { onRecord(customTime); setEditing(false); setCustomTime(''); }}
                        disabled={!customTime || processing}
                        className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${btnBase}`}
                    >
                        Save
                    </button>
                    <button
                        onClick={() => { setEditing(false); setCustomTime(''); }}
                        className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 transition hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* Action buttons */}
            {!editing && (
                <div className="mt-2 flex gap-2">
                    {!hasValue && (
                        <button
                            onClick={() => onRecord()}
                            disabled={disabled || autoDisabled || processing}
                            className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${btnBase}`}
                        >
                            {buttonLabel}
                        </button>
                    )}
                    {!hasValue && (
                        <button
                            onClick={() => setEditing(true)}
                            disabled={disabled || processing}
                            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                            </svg>
                            Manual
                        </button>
                    )}
                    {hasValue && (
                        <button
                            onClick={() => setEditing(true)}
                            disabled={processing}
                            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-500 transition hover:bg-gray-100 disabled:opacity-40"
                        >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                            </svg>
                            Update
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Session Card (reused for AM & PM)                                 */
/* ------------------------------------------------------------------ */
function SessionCard({
    label,
    accent,
    timeIn,
    timeOut,
    totalHours,
    onTimeIn,
    onTimeOut,
    onRedo,
    processing,
    autoDisabled,
}: {
    label: string;
    accent: string;
    timeIn: string | null;
    timeOut: string | null;
    totalHours: number | null;
    onTimeIn: (customTime?: string) => void;
    onTimeOut: (customTime?: string) => void;
    onRedo: () => void;
    processing: boolean;
    autoDisabled: boolean;
}) {
    const hasIn  = !!timeIn;
    const hasOut = !!timeOut;
    const done   = hasIn && hasOut;

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-100">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${accent}`} />
                    {label}
                </h3>
                {hasIn && (
                    <button
                        onClick={onRedo}
                        disabled={processing}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
                        title="Reset this session"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                        </svg>
                        Redo
                    </button>
                )}
            </div>

            {/* Time In row */}
            <div className="mb-2 space-y-2">
                <TimeRow
                    label="Time In"
                    value={timeIn}
                    onRecord={onTimeIn}
                    disabled={false}
                    autoDisabled={autoDisabled}
                    processing={processing}
                    buttonLabel="Time In"
                    buttonColor="blue"
                />

                {/* Time Out row */}
                <TimeRow
                    label="Time Out"
                    value={timeOut}
                    onRecord={onTimeOut}
                    disabled={!hasIn}
                    autoDisabled={autoDisabled}
                    processing={processing}
                    buttonLabel="Time Out"
                    buttonColor="red"
                />

                {/* Hours */}
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5">
                    <span className="text-sm text-gray-500">Hours</span>
                    <span className="text-sm font-medium text-gray-900">
                        {totalHours != null ? `${totalHours} hrs` : '—'}
                    </span>
                </div>
            </div>

            {/* Status pill */}
            <div className="mt-3 text-center">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    done ? 'bg-green-50 text-green-700' : hasIn ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}>
                    {done ? 'Completed' : hasIn ? 'In Progress' : 'Not Started'}
                </span>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Manual Entry Modal                                                */
/* ------------------------------------------------------------------ */
function ManualEntryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const form = useForm({
        date: '',
        am_time_in: '',
        am_time_out: '',
        pm_time_in: '',
        pm_time_out: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('attendance.manualEntry'), {
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Manual Attendance Entry</h3>
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

                    {/* AM */}
                    <fieldset className="rounded-lg border border-gray-200 p-3">
                        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-amber-600">Morning Session</legend>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs text-gray-500">Time In</label>
                                <input
                                    type="time"
                                    value={form.data.am_time_in}
                                    onChange={(e) => form.setData('am_time_in', e.target.value)}
                                    className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-gray-500">Time Out</label>
                                <input
                                    type="time"
                                    value={form.data.am_time_out}
                                    onChange={(e) => form.setData('am_time_out', e.target.value)}
                                    className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </fieldset>

                    {/* PM */}
                    <fieldset className="rounded-lg border border-gray-200 p-3">
                        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-blue-600">Afternoon Session</legend>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs text-gray-500">Time In</label>
                                <input
                                    type="time"
                                    value={form.data.pm_time_in}
                                    onChange={(e) => form.setData('pm_time_in', e.target.value)}
                                    className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-gray-500">Time Out</label>
                                <input
                                    type="time"
                                    value={form.data.pm_time_out}
                                    onChange={(e) => form.setData('pm_time_out', e.target.value)}
                                    className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </fieldset>

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
                            {form.processing ? 'Saving…' : 'Save Entry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                         */
/* ------------------------------------------------------------------ */
export default function TimeInOut({ todayAttendance, attendances }: Props) {
    const [showManual, setShowManual] = useState(false);
    const [processing, setProcessing] = useState(false);

    const today = new Date();
    const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState<string>(todayKey);

    const attendanceMap = useMemo(() => {
        const map: Record<string, Attendance> = {};
        attendances.forEach((entry) => {
            map[entry.date.substring(0, 10)] = entry;
        });
        return map;
    }, [attendances]);

    const post = (routeName: string, data: Record<string, string> = {}) => {
        setProcessing(true);
        router.post(route(routeName), { ...data, date: selectedDate }, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    const selectedAttendance = attendanceMap[selectedDate] ?? (selectedDate === todayKey ? todayAttendance : null);
    const a = selectedAttendance;
    const autoDisabled = selectedDate < todayKey;

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

    return (
        <AppLayout header="Time In / Time Out">
            <Head title="Time In / Out" />

            <div className="mx-auto max-w-5xl space-y-6">
                {/* Clock */}
                <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm shadow-gray-100">
                    <LiveClock />
                </div>

                <div className="grid gap-6 lg:grid-cols-5">
                    {/* Calendar */}
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-gray-100">
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

                            <div className="mb-2 grid grid-cols-7 text-center text-xs font-medium text-gray-400">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                                    <div key={d} className="py-1">{d}</div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: firstDay }).map((_, i) => (
                                    <div key={`empty-${i}`} />
                                ))}

                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const dateKey = formatDateKey(currentYear, currentMonth, day);
                                    const entry = attendanceMap[dateKey];
                                    const hasEntry = !!entry && !!(entry.am_time_in || entry.am_time_out || entry.pm_time_in || entry.pm_time_out);
                                    const isSelected = dateKey === selectedDate;
                                    const isToday = dateKey === todayKey;
                                    const isFuture = dateKey > todayKey;

                                    return (
                                        <button
                                            key={day}
                                            onClick={() => setSelectedDate(dateKey)}
                                            disabled={isFuture}
                                            className={`relative flex h-10 w-full items-center justify-center rounded-lg text-sm transition ${
                                                isFuture
                                                    ? 'cursor-not-allowed text-gray-300'
                                                    : isSelected
                                                    ? 'bg-blue-600 font-semibold text-white'
                                                    : isToday
                                                    ? 'bg-blue-50 font-semibold text-blue-700'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {day}
                                            {hasEntry && !isSelected && !isFuture && (
                                                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-blue-400" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-3 flex items-center gap-4 px-1 text-xs text-gray-400">
                            <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-blue-400" /> Has entry
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-blue-600" /> Selected
                            </span>
                        </div>
                    </div>

                    {/* Sessions */}
                    <div className="space-y-4 lg:col-span-3">
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-gray-100">
                            <p className="text-sm font-semibold text-gray-900">
                                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                                {selectedDate === todayKey
                                    ? 'Today'
                                    : 'Select a date to record time in or time out.'}
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <SessionCard
                                label="Morning Session"
                                accent="bg-amber-400"
                                timeIn={a?.am_time_in ?? null}
                                timeOut={a?.am_time_out ?? null}
                                totalHours={a?.am_total_hours ?? null}
                                onTimeIn={(t) => post('attendance.amTimeIn', t ? { custom_time: t } : {})}
                                onTimeOut={(t) => post('attendance.amTimeOut', t ? { custom_time: t } : {})}
                                onRedo={() => post('attendance.redo', { session: 'am' })}
                                processing={processing}
                                autoDisabled={autoDisabled}
                            />
                            <SessionCard
                                label="Afternoon Session"
                                accent="bg-blue-500"
                                timeIn={a?.pm_time_in ?? null}
                                timeOut={a?.pm_time_out ?? null}
                                totalHours={a?.pm_total_hours ?? null}
                                onTimeIn={(t) => post('attendance.pmTimeIn', t ? { custom_time: t } : {})}
                                onTimeOut={(t) => post('attendance.pmTimeOut', t ? { custom_time: t } : {})}
                                onRedo={() => post('attendance.redo', { session: 'pm' })}
                                processing={processing}
                                autoDisabled={autoDisabled}
                            />
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Selected Date Total</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {a?.total_hours != null ? `${a.total_hours} hrs` : '0.00 hrs'}
                                    </p>
                                </div>
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                    a?.am_time_out && a?.pm_time_out
                                        ? 'bg-green-50 text-green-700'
                                        : a?.am_time_in || a?.pm_time_in
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {a?.am_time_out && a?.pm_time_out ? 'Day Complete' : a?.am_time_in || a?.pm_time_in ? 'In Progress' : 'Not Started'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowManual(true)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-4 py-3.5 text-sm font-semibold text-gray-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add Manual Entry (Today or Past Dates)
                        </button>
                    </div>
                </div>
            </div>

            <ManualEntryModal open={showManual} onClose={() => setShowManual(false)} />
        </AppLayout>
    );
}
