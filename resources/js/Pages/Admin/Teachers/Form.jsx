import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Card from '@/Components/UI/Card';

export default function TeacherForm({ auth, teacher = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: teacher?.user?.name || '',
        email: teacher?.user?.email || '',
        password: '',
        password_confirmation: '',
        employee_id: teacher?.employee_id || '',
        qualification: teacher?.qualification || '',
        date_joined: teacher?.date_joined || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (teacher) {
            put(route('admin.teachers.update', teacher.id));
        } else {
            post(route('admin.teachers.store'));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${teacher ? 'Edit Teacher' : 'Add Teacher'} - SMS`} />

            <Card>
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {teacher ? 'Edit Teacher' : 'Add New Teacher'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="name" value="Full Name" />
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
                            <InputLabel htmlFor="email" value="Email Address" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="employee_id" value="Employee ID" />
                            <TextInput
                                id="employee_id"
                                type="text"
                                name="employee_id"
                                value={data.employee_id}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('employee_id', e.target.value)}
                                required
                            />
                            <InputError message={errors.employee_id} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="qualification" value="Qualification" />
                            <TextInput
                                id="qualification"
                                type="text"
                                name="qualification"
                                value={data.qualification}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('qualification', e.target.value)}
                            />
                            <InputError message={errors.qualification} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="date_joined" value="Date Joined" />
                            <TextInput
                                id="date_joined"
                                type="date"
                                name="date_joined"
                                value={data.date_joined}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('date_joined', e.target.value)}
                            />
                            <InputError message={errors.date_joined} className="mt-2" />
                        </div>
                    </div>

                    {!teacher && (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="password" value="Password" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required={!teacher}
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required={!teacher}
                                />
                                <InputError message={errors.password_confirmation} className="mt-2" />
                            </div>
                        </div>
                    )}

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
                            {processing ? 'Saving...' : (teacher ? 'Update Teacher' : 'Add Teacher')}
                        </button>
                    </div>
                </form>
            </Card>
        </AuthenticatedLayout>
    );
}