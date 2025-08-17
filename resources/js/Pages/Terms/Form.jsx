import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function TermForm() {
    return (
        <AuthenticatedLayout>
            <Head title="Add/Edit Term - SMS" />
            <div className="py-8">
                <h1 className="text-2xl font-bold mb-4">Add/Edit Term</h1>
                <div className="bg-white rounded shadow p-4">
                    {/* TODO: Add term form here */}
                    <p>Term form coming soon.</p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}