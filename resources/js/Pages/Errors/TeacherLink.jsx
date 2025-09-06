import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function TeacherLink({ auth, message }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Account Setup Required
                </h2>
            }
        >
            <Head title="Account Setup Required" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-center">
                            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Account Setup Required</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {message || 'Your account is not properly configured. Please contact the administrator.'}
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={() => window.history.back()}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Go Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
