import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Card from '@/Components/UI/Card';
import Table from '@/Components/UI/Table';
import { Plus, Pencil, Trash2, Download, Upload } from 'lucide-react';

export default function Students({ auth, students, classrooms, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedClass, setSelectedClass] = useState(filters.classroom_id || '');
    const [selectedGender, setSelectedGender] = useState(filters.gender || '');
    
    const columns = [
        { 
            key: 'admission_number', 
            label: 'Admission No.',
            sortable: true
        },
        { 
            key: 'name', 
            label: 'Name',
            sortable: true,
            render: (row) => row.user.name
        },
        { 
            key: 'class', 
            label: 'Class',
            sortable: true,
            render: (row) => row.classroom.name
        },
        { 
            key: 'gender', 
            label: 'Gender',
            sortable: true,
            render: (row) => row.gender.charAt(0).toUpperCase() + row.gender.slice(1)
        },
        { 
            key: 'parent_name', 
            label: 'Parent/Guardian',
            sortable: true
        },
        { 
            key: 'parent_phone', 
            label: 'Contact',
            sortable: true
        }
    ];

    const handleFilters = (e) => {
        e?.preventDefault();
        router.get(route('admin.students.index'), {
            search: searchTerm,
            classroom_id: selectedClass,
            gender: selectedGender
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedClass('');
        setSelectedGender('');
        router.get(route('admin.students.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Debounced filter effect
    useEffect(() => {
        const timer = setTimeout(() => {
            handleFilters();
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, selectedClass, selectedGender]);

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this student?')) {
            router.delete(route('admin.students.destroy', id), {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    // Toast notification can be added here
                }
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head>
                <title>Students - SMS</title>
            </Head>

            <div className="space-y-6">
                <Card>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Students</h2>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    onChange={(e) => {
                                        const formData = new FormData();
                                        formData.append('file', e.target.files[0]);
                                        router.post(route('admin.students.import'), formData);
                                        e.target.value = null;
                                    }}
                                    accept=".xlsx,.xls"
                                />
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('file-upload').click()}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Import
                                </button>
                            </div>
                            <a
                                href={route('admin.students.export')}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </a>
                            <Link
                                href={route('admin.students.create')}

                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Student
                            </Link>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                                </svg>
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </button>
                        </div>

                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                                    <input
                                        type="text"
                                        name="search"
                                        id="search"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            handleFilters();
                                        }}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        placeholder="Search by name, email, or admission number..."
                                    />
                                </div>

                                <div>
                                    <label htmlFor="classroom" className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                    <select
                                        id="classroom"
                                        value={selectedClass}
                                        onChange={(e) => {
                                            setSelectedClass(e.target.value);
                                            handleFilters();
                                        }}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    >
                                        <option value="">All Classes</option>
                                        {classrooms?.map((classroom) => (
                                            <option key={classroom.id} value={classroom.id}>
                                                {classroom.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <select
                                        id="gender"
                                        value={selectedGender}
                                        onChange={(e) => {
                                            setSelectedGender(e.target.value);
                                            handleFilters();
                                        }}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    >
                                        <option value="">All Genders</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>

                                <div className="md:col-span-3 flex justify-end">
                                    <button
                                        onClick={resetFilters}
                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 mr-2"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <Table
                        columns={columns}
                        data={students.data}
                        actions={(row) => (
                            <div className="flex items-center space-x-3">
                                <Link
                                    href={route('admin.students.edit', row.id)}

                                    className="text-indigo-600 hover:text-indigo-900"
                                >
                                    <Pencil className="h-5 w-5" />
                                </Link>
                                <button
                                    onClick={() => handleDelete(row.id)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                        pagination={students.meta}
                    />
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
