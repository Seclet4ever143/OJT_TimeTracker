import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            birthday: user.birthday || '',
            company: user.company || '',
            department: user.department || '',
            position: user.position || '',
            supervisor: user.supervisor || '',
            address: user.address || '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    const inputClass =
        'block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

    return (
        <section>
            <header>
                <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Update your personal details and OJT information.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                {/* Personal Info Section */}
                <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        Personal Details
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">Full Name *</label>
                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                className={inputClass}
                            />
                            <InputError className="mt-1" message={errors.name} />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email Address *</label>
                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                className={inputClass}
                            />
                            <InputError className="mt-1" message={errors.email} />
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                id="phone"
                                type="tel"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="09XX XXX XXXX"
                                className={inputClass}
                            />
                            <InputError className="mt-1" message={errors.phone} />
                        </div>

                        {/* Birthday */}
                        <div>
                            <label htmlFor="birthday" className="mb-1 block text-sm font-medium text-gray-700">Birthday</label>
                            <input
                                id="birthday"
                                type="date"
                                value={data.birthday}
                                onChange={(e) => setData('birthday', e.target.value)}
                                className={inputClass}
                            />
                            <InputError className="mt-1" message={errors.birthday} />
                        </div>

                        {/* Address — full width */}
                        <div className="sm:col-span-2">
                            <label htmlFor="address" className="mb-1 block text-sm font-medium text-gray-700">Address</label>
                            <input
                                id="address"
                                type="text"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="City, Province"
                                className={inputClass}
                            />
                            <InputError className="mt-1" message={errors.address} />
                        </div>
                    </div>
                </div>

                {/* OJT / Work Section */}
                <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                        OJT / Work Information
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Company */}
                        <div>
                            <label htmlFor="company" className="mb-1 block text-sm font-medium text-gray-700">Company / Organization</label>
                            <input
                                id="company"
                                type="text"
                                value={data.company}
                                onChange={(e) => setData('company', e.target.value)}
                                placeholder="e.g. Acme Corp"
                                className={inputClass}
                            />
                            <InputError className="mt-1" message={errors.company} />
                        </div>

                        {/* Department */}
                        <div>
                            <label htmlFor="department" className="mb-1 block text-sm font-medium text-gray-700">Department</label>
                            <input
                                id="department"
                                type="text"
                                value={data.department}
                                onChange={(e) => setData('department', e.target.value)}
                                placeholder="e.g. IT Department"
                                className={inputClass}
                            />
                            <InputError className="mt-1" message={errors.department} />
                        </div>

                        {/* Position */}
                        <div>
                            <label htmlFor="position" className="mb-1 block text-sm font-medium text-gray-700">Position / Role</label>
                            <input
                                id="position"
                                type="text"
                                value={data.position}
                                onChange={(e) => setData('position', e.target.value)}
                                placeholder="e.g. OJT Intern"
                                className={inputClass}
                            />
                            <InputError className="mt-1" message={errors.position} />
                        </div>

                        {/* Supervisor */}
                        <div>
                            <label htmlFor="supervisor" className="mb-1 block text-sm font-medium text-gray-700">Supervisor</label>
                            <input
                                id="supervisor"
                                type="text"
                                value={data.supervisor}
                                onChange={(e) => setData('supervisor', e.target.value)}
                                placeholder="Supervisor's name"
                                className={inputClass}
                            />
                            <InputError className="mt-1" message={errors.supervisor} />
                        </div>
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm text-amber-800">
                            Your email address is unverified.{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="font-medium underline hover:text-amber-900"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {processing ? 'Saving…' : 'Save Changes'}
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-medium text-green-600">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
