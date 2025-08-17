import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Card from '@/Components/UI/Card';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Select from '@/Components/UI/Select';

export default function StudentForm({ auth, student = null, classrooms }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: student?.user?.name || '',
        email: student?.user?.email || '',
        admission_number: student?.admission_number || '',
        classroom_id: student?.classroom_id || '',
        date_of_birth: student?.date_of_birth || '',
        gender: student?.gender || '',
        parent_name: student?.parent_name || '',
        parent_phone: student?.parent_phone || '',
        address: student?.address || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (student) {
            put(route('admin.students.update', student.id));
        } else {
            post(route('admin.students.store'));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${student ? 'Edit' : 'Add'} Student - SMS`} />

            <Card>
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {student ? 'Edit Student' : 'Add New Student'}
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
                            <InputLabel htmlFor="email" value="Email" />
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
                            <InputLabel htmlFor="admission_number" value="Admission Number" />
                            <TextInput
                                id="admission_number"
                                type="text"
                                name="admission_number"
                                value={data.admission_number}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('admission_number', e.target.value)}
                                required
                            />
                            <InputError message={errors.admission_number} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="classroom_id" value="Class" />
                            <Select
                                id="classroom_id"
                                name="classroom_id"
                                value={data.classroom_id}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('classroom_id', e.target.value)}
                                required
                            >
                                <option value="">Select a class</option>
                                {classrooms.map((classroom) => (
                                    <option key={classroom.id} value={classroom.id}>
                                        {classroom.name}
                                    </option>
                                ))}
                            </Select>
                            <InputError message={errors.classroom_id} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="date_of_birth" value="Date of Birth" />
                            <TextInput
                                id="date_of_birth"
                                type="date"
                                name="date_of_birth"
                                value={data.date_of_birth}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('date_of_birth', e.target.value)}
                                required
                            />
                            <InputError message={errors.date_of_birth} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="gender" value="Gender" />
                            <Select
                                id="gender"
                                name="gender"
                                value={data.gender}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('gender', e.target.value)}
                                required
                            >
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </Select>
                            <InputError message={errors.gender} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="parent_name" value="Parent/Guardian Name" />
                            <TextInput
                                id="parent_name"
                                type="text"
                                name="parent_name"
                                value={data.parent_name}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('parent_name', e.target.value)}
                                required
                            />
                            <InputError message={errors.parent_name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="parent_phone" value="Parent/Guardian Phone" />
                            <TextInput
                                id="parent_phone"
                                type="text"
                                name="parent_phone"
                                value={data.parent_phone}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('parent_phone', e.target.value)}
                                required
                            />
                            <InputError message={errors.parent_phone} className="mt-2" />
                        </div>

                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="address" value="Address" />
                            <textarea
                                id="address"
                                name="address"
                                rows={3}
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                className="mt-1 block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:py-1.5 sm:text-sm sm:leading-6"
                                required
                            />
                            <InputError message={errors.address} className="mt-2" />
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
                            {processing ? 'Saving...' : (student ? 'Update Student' : 'Add Student')}
                        </button>
                    </div>
                </form>
            </Card>
        </AuthenticatedLayout>
    );
}
