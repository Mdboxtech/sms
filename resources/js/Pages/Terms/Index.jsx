import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Terms() {
    return (
        <AuthenticatedLayout>
            <Head title="Terms - SMS" />
            <div className="py-8">
                <h1 className="text-2xl font-bold mb-4">Terms</h1>
                <div className="bg-white rounded shadow p-4">
                    {/* TODO: Add terms table/list here */}
                    <p>Term management coming soon.</p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
