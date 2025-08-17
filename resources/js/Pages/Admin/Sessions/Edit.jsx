import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Calendar, Save, ArrowLeft } from 'lucide-react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';

export default function Edit({ session }) {
    const { data, setData, put, processing, errors } = useForm({
        name: session.name || '',
        start_date: session.start_date || '',
        end_date: session.end_date || '',
        is_current: session.is_current || false
    });

    function handleSubmit(e) {
        e.preventDefault();
        put(route('admin.sessions.update', session.id));
    }

    return (
        <AuthenticatedLayout>
            <Head title="Edit Academic Session" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <Calendar className="w-8 h-8 text-indigo-500 mr-2" />
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                        Edit Academic Session
                                    </h2>
                                </div>
                                <Link
                                    href={route('admin.sessions.index')}
                                    className="inline-flex items-center px-4 py-2 bg-gray-800 dark:bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-white dark:text-gray-800 uppercase tracking-widest hover:bg-gray-700 dark:hover:bg-white focus:bg-gray-700 dark:focus:bg-white active:bg-gray-900 dark:active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Sessions
                                </Link>
                            </div>

                            <form onSubmit={handleSubmit} className="max-w-2xl">
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
                                    <div>
                                        <InputLabel htmlFor="name" value="Session Name" />
                                        <TextInput
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={data.name}
                                            className="mt-1 block w-full"
                                            onChange={e => setData('name', e.target.value)}
                                            required
                                            isFocused
                                        />
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="start_date" value="Start Date" />
                                        <TextInput
                                            id="start_date"
                                            type="date"
                                            name="start_date"
                                            value={data.start_date}
                                            className="mt-1 block w-full"
                                            onChange={e => setData('start_date', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.start_date} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="end_date" value="End Date" />
                                        <TextInput
                                            id="end_date"
                                            type="date"
                                            name="end_date"
                                            value={data.end_date}
                                            className="mt-1 block w-full"
                                            onChange={e => setData('end_date', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.end_date} className="mt-2" />
                                    </div>

                                    <div className="flex items-center">
                                        <Checkbox
                                            id="is_current"
                                            name="is_current"
                                            checked={data.is_current}
                                            onChange={e => setData('is_current', e.target.checked)}
                                        />
                                        <InputLabel htmlFor="is_current" value="Set as Current Session" className="ml-2" />
                                    </div>

                                    <div className="flex items-center justify-end mt-6 space-x-3">
                                        <Link
                                            href={route('admin.sessions.index')}
                                            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-md font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-25 transition ease-in-out duration-150"
                                        >
                                            Cancel
                                        </Link>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
