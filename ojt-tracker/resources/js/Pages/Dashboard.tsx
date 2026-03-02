import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Attendance, DiaryEntry } from '@/types';
import { useState } from 'react';

interface Props {
    todayAttendance: Attendance | null;
    renderedHours: number;
    excessHours: number;
    requiredHours: number;
    remainingHours: number;
    completionPercent: number;
    daysCompleted: number;
    daysPresent: number;
    recentAttendance: Attendance[];
    recentDiaries: DiaryEntry[];
}

function SummaryCard({ label, value, subtitle, icon, accent }: { label: string; value: string; subtitle?: string; icon: React.ReactNode; accent: string }) {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm shadow-gray-100">
            <div className="flex items-center gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${accent}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
                </div>
            </div>
        </div>
    );
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

const moodEmoji: Record<string, string> = {
    happy: '😊',
    neutral: '😐',
    tired: '😴',
    stressed: '😰',
    productive: '🚀',
};

export default function Dashboard({ todayAttendance, renderedHours, excessHours, requiredHours, remainingHours, completionPercent, daysCompleted, daysPresent, recentAttendance, recentDiaries }: Props) {
    const now = new Date();
    const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';

    const [editingHours, setEditingHours] = useState(false);
    const form = useForm({ required_hours: String(requiredHours) });

    const handleSaveRequiredHours = (e: React.FormEvent) => {
        e.preventDefault();
        form.patch(route('dashboard.updateRequiredHours'), {
            preserveScroll: true,
            onSuccess: () => setEditingHours(false),
        });
    };

    return (
        <AppLayout header="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Greeting */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{greeting}!</h2>
                    <p className="text-gray-500">Here's your OJT overview for today.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <SummaryCard
                        label="Rendered Hours"
                        value={renderedHours.toFixed(1)}
                        subtitle="8AM–12PM & 1PM–5PM only"
                        accent="bg-blue-50 text-blue-600"
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        }
                    />
                    <SummaryCard
                        label="Excess Hours"
                        value={excessHours.toFixed(1)}
                        subtitle="Outside renderable window"
                        accent="bg-orange-50 text-orange-600"
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                        }
                    />
                    <SummaryCard
                        label="Days Completed"
                        value={String(daysCompleted)}
                        accent="bg-green-50 text-green-600"
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        }
                    />
                    <SummaryCard
                        label="Today's Status"
                        value={todayAttendance
                            ? (todayAttendance.am_time_out && todayAttendance.pm_time_out ? 'Completed' : (todayAttendance.am_time_in || todayAttendance.pm_time_in ? 'In Progress' : 'Not yet'))
                            : 'Not yet'}
                        accent="bg-amber-50 text-amber-600"
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                            </svg>
                        }
                    />
                </div>

                {/* Progress Towards Required Hours */}
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm shadow-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-900">OJT Rendering Progress</h3>
                            <p className="text-sm text-gray-500">
                                {renderedHours.toFixed(1)} of{' '}
                                {editingHours ? '' : `${requiredHours} hours rendered`}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {editingHours ? (
                                <form onSubmit={handleSaveRequiredHours} className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        max="9999"
                                        step="1"
                                        value={form.data.required_hours}
                                        onChange={(e) => form.setData('required_hours', e.target.value)}
                                        className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        autoFocus
                                    />
                                    <span className="text-sm text-gray-500">hrs</span>
                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setEditingHours(false); form.setData('required_hours', String(requiredHours)); }}
                                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setEditingHours(true)}
                                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                                    </svg>
                                    Set Hours
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
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

                    {/* Stats row */}
                    <div className="mt-4 grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                        <div className="text-center">
                            <p className="text-xs text-gray-500">Rendered</p>
                            <p className="text-lg font-bold text-blue-600">{renderedHours.toFixed(1)}h</p>
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

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                    <Link
                        href={route('attendance.index')}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        {todayAttendance && !(todayAttendance.am_time_out && todayAttendance.pm_time_out) ? 'Continue Today' : 'Time In'}
                    </Link>
                    <Link
                        href={route('diary.index')}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                        Write Diary
                    </Link>
                </div>

                {/* Two-column: Recent Attendance + Recent Diaries */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Attendance */}
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm shadow-gray-100">
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <h3 className="font-semibold text-gray-900">Recent Attendance</h3>
                            <Link href={route('attendance.history')} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                View all
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {recentAttendance.length === 0 ? (
                                <p className="px-5 py-8 text-center text-sm text-gray-400">No attendance records yet.</p>
                            ) : (
                                recentAttendance.map((a) => (
                                    <div key={a.id} className="flex items-center justify-between px-5 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {new Date(a.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                AM: {a.am_time_in ? new Date(a.am_time_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                                                {' → '}
                                                {a.am_time_out ? new Date(a.am_time_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                                                {' | PM: '}
                                                {a.pm_time_in ? new Date(a.pm_time_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                                                {' → '}
                                                {a.pm_time_out ? new Date(a.pm_time_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-gray-600">
                                                {a.total_hours ? `${a.total_hours}h` : '—'}
                                            </span>
                                            <StatusBadge status={a.status} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Diaries */}
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm shadow-gray-100">
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <h3 className="font-semibold text-gray-900">Recent Diary Entries</h3>
                            <Link href={route('diary.index')} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                View all
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {recentDiaries.length === 0 ? (
                                <p className="px-5 py-8 text-center text-sm text-gray-400">No diary entries yet.</p>
                            ) : (
                                recentDiaries.map((d) => (
                                    <div key={d.id} className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{moodEmoji[d.mood] || '😐'}</span>
                                            <p className="text-sm font-medium text-gray-900">{d.title}</p>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-400">
                                            {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </p>
                                        {d.content && (
                                            <p className="mt-1 line-clamp-2 text-sm text-gray-500">{d.content}</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
