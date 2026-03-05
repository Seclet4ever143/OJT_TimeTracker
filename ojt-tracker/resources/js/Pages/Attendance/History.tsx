import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Attendance, PaginatedData } from '@/types';
import { useState } from 'react';

interface Props {
    attendances: PaginatedData<Attendance>;
    totalHours: number;
    daysCompleted: number;
    requiredHours: number;
    remainingHours: number;
    completionPercent: number;
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        present: 'bg-green-50 text-green-700',
        late: 'bg-yellow-50 text-yellow-700',
        absent: 'bg-red-50 text-red-700',
    };
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-gray-50 text-gray-700'}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

function formatTime(ts: string | null) {
    if (!ts) return '—';
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Manila' });
}

/** Extract HH:mm from a timestamp string for the time input */
function toTimeInput(ts: string | null): string {
    if (!ts) return '';
    const d = new Date(ts);
    // Convert to Manila time
    const manila = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    const h = manila.getHours().toString().padStart(2, '0');
    const m = manila.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
}

/* ------------------------------------------------------------------ */
/*  Edit Modal                                                        */
/* ------------------------------------------------------------------ */
function EditModal({ attendance, onClose }: { attendance: Attendance; onClose: () => void }) {
    const form = useForm({
        date: attendance.date.split('T')[0],
        am_time_in: toTimeInput(attendance.am_time_in),
        am_time_out: toTimeInput(attendance.am_time_out),
        pm_time_in: toTimeInput(attendance.pm_time_in),
        pm_time_out: toTimeInput(attendance.pm_time_out),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(route('attendance.update', attendance.id), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Attendance</h3>
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
                            {form.processing ? 'Saving…' : 'Update'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  History Page                                                      */
/* ------------------------------------------------------------------ */
export default function History({ attendances, totalHours, daysCompleted, requiredHours, remainingHours, completionPercent }: Props) {
    const [editing, setEditing] = useState<Attendance | null>(null);

    return (
        <AppLayout header="Attendance History">
            <Head title="Attendance History" />

            <div className="space-y-6">
                {/* Summary */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm shadow-gray-100">
                        <p className="text-sm text-gray-500">Total Hours Logged</p>
                        <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)} hrs</p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm shadow-gray-100">
                        <p className="text-sm text-gray-500">Days Completed</p>
                        <p className="text-2xl font-bold text-gray-900">{daysCompleted}</p>
                    </div>
                </div>

                {/* Rendering Progress */}
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm shadow-gray-100">
                    <h3 className="font-semibold text-gray-900">Rendering Progress</h3>
                    <p className="text-sm text-gray-500">
                        {totalHours.toFixed(1)} of {requiredHours} hours rendered
                    </p>

                    <div className="mt-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-700">{completionPercent}%</span>
                            <span className="text-gray-500">{remainingHours.toFixed(1)} hrs remaining</span>
                        </div>
                        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                                style={{ width: `${completionPercent}%` }}
                            />
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                        <div className="text-center">
                            <p className="text-xs text-gray-500">Rendered</p>
                            <p className="text-lg font-bold text-blue-600">{totalHours.toFixed(1)}h</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500">Remaining</p>
                            <p className="text-lg font-bold text-gray-900">{remainingHours.toFixed(1)}h</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500">Required</p>
                            <p className="text-lg font-bold text-gray-900">{requiredHours}h</p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm shadow-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead>
                                <tr className="bg-gray-50/80">
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-amber-600">AM In</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-amber-600">AM Out</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-blue-600">PM In</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-blue-600">PM Out</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Hours</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {attendances.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                                            No attendance records found.
                                        </td>
                                    </tr>
                                ) : (
                                    attendances.data.map((a) => (
                                        <tr key={a.id} className="transition hover:bg-gray-50/50">
                                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                                                <div>
                                                    {new Date(a.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                {a.is_manual && (
                                                    <span className="text-[10px] font-medium text-purple-500">Manual</span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                                {formatTime(a.am_time_in)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                                {formatTime(a.am_time_out)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                                {formatTime(a.pm_time_in)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                                {formatTime(a.pm_time_out)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                                {a.total_hours ? `${a.total_hours} hrs` : '—'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3">
                                                <StatusBadge status={a.status} />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => setEditing(a)}
                                                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                                                        </svg>
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Delete this attendance record?')) {
                                                                router.delete(route('attendance.destroy', a.id), { preserveScroll: true });
                                                            }
                                                        }}
                                                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {attendances.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
                            <p className="text-sm text-gray-500">
                                Showing {attendances.from}–{attendances.to} of {attendances.total}
                            </p>
                            <div className="flex gap-1">
                                {attendances.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        preserveScroll
                                        className={`rounded-lg px-3 py-1.5 text-sm transition ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : link.url
                                                ? 'text-gray-600 hover:bg-gray-100'
                                                : 'cursor-not-allowed text-gray-300'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {editing && <EditModal attendance={editing} onClose={() => setEditing(null)} />}
        </AppLayout>
    );
}
