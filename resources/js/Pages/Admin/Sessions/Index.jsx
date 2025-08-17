import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PlusCircle, Pencil, Calendar, Clock, Trash2, Check, X } from 'lucide-react';
import Modal from '@/Components/Modal';
import { format } from 'date-fns';

export default function Index({ sessions }) {
    const { flash } = usePage().props;
    const [deleteModal, setDeleteModal] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState(null);

    const confirmDelete = (session) => {
        setSessionToDelete(session);
        setDeleteModal(true);
    };

    const handleDelete = () => {
        if (sessionToDelete) {
            router.delete(route('admin.sessions.destroy', sessionToDelete.id), {
                onSuccess: () => {
                    setDeleteModal(false);
                    setSessionToDelete(null);
                },
            });
        }
    };

    const toggleActive = (session) => {
        router.put(route('admin.sessions.toggle', session.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Academic Sessions" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center">
                                    <Calendar className="w-8 h-8 text-indigo-500 mr-2" />
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                        Academic Sessions
                                    </h2>
                                </div>
                                <Link
                                    href={route('admin.sessions.create')}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Add New Session
                                </Link>
                            </div>

                            {flash.message && (
                                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded relative">
                                    {flash.message}
                                </div>
                            )}

                            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Session Name
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Start Date
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                End Date
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {sessions.map((session) => (
                                            <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Clock className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {session.name}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {format(new Date(session.start_date), 'MMM d, yyyy')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {format(new Date(session.end_date), 'MMM d, yyyy')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        session.is_current
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-200 dark:text-green-900'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-200 dark:text-gray-900'
                                                    }`}>
                                                        {session.is_current ? 'Current' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                                    <Link
                                                        href={route('admin.sessions.edit', session.id)}
                                                        className="inline-flex items-center text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    >
                                                        <Pencil className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </Link>
                                                    
                                                    <button
                                                        onClick={() => toggleActive(session)}
                                                        className={`inline-flex items-center ${
                                                            session.is_current
                                                                ? 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                                                : 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300'
                                                        }`}
                                                    >
                                                        {session.is_current ? (
                                                            <>
                                                                <X className="w-4 h-4 mr-2" />
                                                                Deactivate
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Check className="w-4 h-4 mr-2" />
                                                                Set Active
                                                            </>
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={() => confirmDelete(session)}
                                                        className="inline-flex items-center text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Delete Confirmation Modal */}
                                <Modal show={deleteModal} onClose={() => setDeleteModal(false)}>
                                    <div className="p-6">
                                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                            Delete Academic Session
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                            Are you sure you want to delete the academic session "{sessionToDelete?.name}"?
                                            This action cannot be undone.
                                        </p>

                                        <div className="mt-6 flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-500 rounded-md font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-25 transition ease-in-out duration-150"
                                                onClick={() => setDeleteModal(false)}
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="button"
                                                className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                                                onClick={handleDelete}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete Session
                                            </button>
                                        </div>
                                    </div>
                                </Modal>
                                
                                {sessions.length === 0 && (
                                    <div className="text-center py-8">
                                        <Clock className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No sessions</h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            Get started by creating a new academic session.
                                        </p>
                                        <div className="mt-6">
                                            <Link
                                                href={route('admin.sessions.create')}
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <PlusCircle className="w-5 h-5 mr-2" />
                                                New Session
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
