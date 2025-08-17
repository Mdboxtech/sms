import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { School, Save, ArrowLeft } from 'lucide-react';

export default function Edit({ classroom }) {
    const { data, setData, put, processing, errors } = useForm({
        name: classroom.name || '',
        section: classroom.section || '',
        capacity: classroom.capacity || '',
        description: classroom.description || ''
    });

    function handleSubmit(e) {
        e.preventDefault();
        put(route('admin.classrooms.update', classroom.id));
    }

    return (
        <AuthenticatedLayout>
            <Head title="Edit Classroom" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <School className="w-8 h-8 text-indigo-500 mr-2" />
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                        Edit Classroom: {classroom.name}
                                    </h2>
                                </div>
                                <Link
                                    href={route('admin.classrooms.index')}
                                    className="inline-flex items-center px-4 py-2 bg-gray-800 dark:bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-white dark:text-gray-800 uppercase tracking-widest hover:bg-gray-700 dark:hover:bg-white focus:bg-gray-700 dark:focus:bg-white active:bg-gray-900 dark:active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Classrooms
                                </Link>
                            </div>

                            <form onSubmit={handleSubmit} className="max-w-2xl">
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
                                    <div>
                                        <InputLabel htmlFor="name" value="Classroom Name" />
                                        <TextInput
                                            id="name"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            required
                                            isFocused
                                        />
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="section" value="Section" />
                                        <TextInput
                                            id="section"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.section}
                                            onChange={e => setData('section', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.section} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="capacity" value="Capacity" />
                                        <TextInput
                                            id="capacity"
                                            type="number"
                                            className="mt-1 block w-full"
                                            value={data.capacity}
                                            onChange={e => setData('capacity', e.target.value)}
                                            required
                                            min="1"
                                        />
                                        <InputError message={errors.capacity} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="description" value="Description (Optional)" />
                                        <textarea
                                            id="description"
                                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            rows="3"
                                        />
                                        <InputError message={errors.description} className="mt-2" />
                                    </div>

                                    <div className="flex items-center justify-end mt-6 space-x-3">
                                        <Link
                                            href={route('admin.classrooms.index')}
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
