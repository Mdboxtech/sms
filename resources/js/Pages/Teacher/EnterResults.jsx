import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function EnterResults({ auth, students = [], subjects = [], terms = [] }) {
    return (
        <AuthenticatedLayout>
            <Head title="Enter Results - SMS" />
            <div className="py-8">
                <h1 className="text-2xl font-bold mb-4">Enter Results</h1>
                <div className="bg-white rounded shadow p-4">
                    <p>Result entry form coming soon.</p>
                    <p>Students: {students.length}</p>
                    <p>Subjects: {subjects.length}</p>
                    <p>Terms: {terms.length}</p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 