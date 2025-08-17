import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function ClassroomForm({ auth, classroom = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: classroom?.name || '',
        section: classroom?.section || '',
        description: classroom?.description || '',
        capacity: classroom?.capacity || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (classroom) {
            put(route('classrooms.update', classroom.id));
        } else {
            post(route('admin.classrooms.store'));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={classroom ? 'Edit Classroom' : 'Add Classroom'} />
            <div className="py-8">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h1 className="text-2xl font-bold text-gray-900 mb-6">
                                {classroom ? 'Edit Classroom' : 'Add New Classroom'}
                            </h1>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Classroom Name" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="section" value="Section" />
                                    <TextInput
                                        id="section"
                                        type="text"
                                        name="section"
                                        value={data.section}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('section', e.target.value)}
                                    />
                                    <InputError message={errors.section} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="description" value="Description" />
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={3}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="capacity" value="Capacity" />
                                    <TextInput
                                        id="capacity"
                                        type="number"
                                        name="capacity"
                                        value={data.capacity}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('capacity', e.target.value)}
                                    />
                                    <InputError message={errors.capacity} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => window.history.back()}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Saving...' : (classroom ? 'Update Classroom' : 'Create Classroom')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}