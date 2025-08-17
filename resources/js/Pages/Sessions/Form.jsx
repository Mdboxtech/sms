import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function SessionForm() {
    return (
        <AuthenticatedLayout>
            <Head title="Add/Edit Session - SMS" />
            <div className="py-8">
                <h1 className="text-2xl font-bold mb-4">Add/Edit Session</h1>
                <div className="bg-white rounded shadow p-4">
                    {/* TODO: Add session form here */}
                    <p>Session form coming soon.</p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}