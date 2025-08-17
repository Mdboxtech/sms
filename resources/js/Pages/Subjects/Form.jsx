import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Card from '@/Components/UI/Card';

export default function SubjectForm({ auth, subject = null, classrooms = [], teachers = [] }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: subject?.name || '',
        code: subject?.code || '',
        description: subject?.description || '',
        classroom_ids: subject?.classrooms?.map(c => c.id) || [],
        teacher_ids: subject?.teachers?.map(t => t.id) || [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (subject) {
            put(route('admin.subjects.update', subject.id));
        } else {
            post(route('admin.subjects.store'));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${subject ? 'Edit Subject' : 'Add Subject'} - SMS`} />

            <Card>
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {subject ? 'Edit Subject' : 'Add New Subject'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="name" value="Subject Name" />
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
                            <InputLabel htmlFor="code" value="Subject Code" />
                            <TextInput
                                id="code"
                                type="text"
                                name="code"
                                value={data.code}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('code', e.target.value)}
                                required
                            />
                            <InputError message={errors.code} className="mt-2" />
                        </div>

                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="description" value="Description" />
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="mt-1 block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:py-1.5 sm:text-sm sm:leading-6"
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="classrooms" value="Assign to Classes" />
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {classrooms.map((classroom) => (
                                    <label key={classroom.id} className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={data.classroom_ids.includes(classroom.id)}
                                            onChange={(e) => {
                                                const newClassrooms = e.target.checked
                                                    ? [...data.classroom_ids, classroom.id]
                                                    : data.classroom_ids.filter(id => id !== classroom.id);
                                                setData('classroom_ids', newClassrooms);
                                            }}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <span className="text-gray-900">{classroom.name}</span>
                                    </label>
                                ))}
                            </div>
                            <InputError message={errors.classroom_ids} className="mt-2" />
                        </div>

                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="teachers" value="Assign to Teachers" />
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {teachers.map((teacher) => (
                                    <label key={teacher.id} className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={data.teacher_ids.includes(teacher.id)}
                                            onChange={(e) => {
                                                const newTeachers = e.target.checked
                                                    ? [...data.teacher_ids, teacher.id]
                                                    : data.teacher_ids.filter(id => id !== teacher.id);
                                                setData('teacher_ids', newTeachers);
                                            }}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <span className="text-gray-900">{teacher.user.name}</span>
                                    </label>
                                ))}
                            </div>
                            <InputError message={errors.teacher_ids} className="mt-2" />
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : (subject ? 'Update Subject' : 'Add Subject')}
                        </button>
                    </div>
                </form>
            </Card>
        </AuthenticatedLayout>
    );
}