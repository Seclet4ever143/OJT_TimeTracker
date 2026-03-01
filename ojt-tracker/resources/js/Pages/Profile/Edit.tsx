import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AppLayout header="Profile">
            <Head title="Profile" />

            <div className="space-y-6">
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-100">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                    />
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-100">
                    <UpdatePasswordForm />
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-100">
                    <DeleteUserForm />
                </div>
            </div>
        </AppLayout>
    );
}
