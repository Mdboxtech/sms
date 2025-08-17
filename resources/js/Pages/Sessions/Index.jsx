import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Sessions() {
    return (
        <AuthenticatedLayout>
            <Head title="Sessions - SMS" />
            <div className="py-8">
                <h1 className="text-2xl font-bold mb-4">Sessions</h1>
                <div className="bg-white rounded shadow p-4">
                    {/* TODO: Add sessions table/list here */}
                    <p>Session management coming soon.</p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}