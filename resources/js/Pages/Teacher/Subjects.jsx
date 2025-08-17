import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function TeacherSubjects({ auth, subjects = [] }) {
    return (
        <AuthenticatedLayout>
            <Head title="My Subjects - SMS" />
            <div className="py-8">
                <h1 className="text-2xl font-bold mb-4">My Subjects</h1>
                <div className="bg-white rounded shadow p-4">
                    {subjects.length === 0 ? (
                        <p>No subjects assigned yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {subjects.map((subject) => (
                                <div key={subject.id} className="border rounded p-4">
                                    <h3 className="font-semibold">{subject.name}</h3>
                                    <p className="text-gray-600">Class: {subject.classroom?.name || 'N/A'}</p>
                                    <p className="text-gray-600">Students: {subject.students_count || 0}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 