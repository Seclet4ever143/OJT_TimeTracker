import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Attendance } from '@/types';
import { useEffect, useState } from 'react';

interface Props {
    todayAttendance: Attendance | null;
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
    processing,
    buttonLabel,
    buttonColor,
}: {
    label: string;
    value: string | null;
    onRecord: (customTime?: string) => void;
    disabled: boolean;
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
                            disabled={disabled || processing}
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
export default function TimeInOut({ todayAttendance }: Props) {
    const [showManual, setShowManual] = useState(false);
    const [processing, setProcessing] = useState(false);

    const post = (routeName: string, data: Record<string, string> = {}) => {
        setProcessing(true);
        router.post(route(routeName), data, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    const a = todayAttendance;

    return (
        <AppLayout header="Time In / Time Out">
            <Head title="Time In / Out" />

            <div className="mx-auto max-w-2xl space-y-6">
                {/* Clock */}
                <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm shadow-gray-100">
                    <LiveClock />
                </div>

                {/* AM & PM Session Cards */}
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
                    />
                </div>

                {/* Today's Total */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Today's Total</p>
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

                {/* Manual Entry Button */}
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

            <ManualEntryModal open={showManual} onClose={() => setShowManual(false)} />
        </AppLayout>
    );
}
