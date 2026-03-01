import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen">
            {/* Left panel — branding */}
            <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-blue-600 to-blue-800 p-12 text-white lg:flex">
                <div>
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 font-bold text-sm backdrop-blur">
                            OJT
                        </div>
                        <span className="text-xl font-semibold">OJT Tracker</span>
                    </Link>
                </div>

                <div className="space-y-4">
                    <h2 className="text-3xl font-bold leading-tight">
                        Track your internship<br />hours effortlessly.
                    </h2>
                    <p className="max-w-sm text-blue-100/90">
                        Time in, time out, and keep a daily diary of your OJT experience — all in one place.
                    </p>
                </div>

                <p className="text-sm text-blue-200/60">© 2026 OJT Tracker</p>
            </div>

            {/* Right panel — form */}
            <div className="flex w-full flex-col items-center justify-center bg-gray-50 px-6 py-12 lg:w-1/2">
                {/* Mobile logo */}
                <div className="mb-8 lg:hidden">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-sm text-white shadow-md">
                            OJT
                        </div>
                        <span className="text-xl font-semibold text-gray-900">OJT Tracker</span>
                    </Link>
                </div>

                <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg shadow-gray-200/50">
                    {children}
                </div>
            </div>
        </div>
    );
}
