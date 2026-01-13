import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Card from '@/Components/UI/Card';
import Table from '@/Components/UI/Table';
import Button from '@/Components/UI/Button';
import { Plus, Pencil, Trash2, Download, Upload, Eye, FileSpreadsheet, Users, Filter } from 'lucide-react';

export default function Students({ auth, students, classrooms, filters }) {
    // Initialize state with URL params to prevent unnecessary updates
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(
        // Show filters by default if any filter is active
        !!(filters.search || filters.classroom_id || filters.gender)
    );
    const [selectedClass, setSelectedClass] = useState(filters.classroom_id || '');
    const [selectedGender, setSelectedGender] = useState(filters.gender || '');
    
    // Track if we're in the middle of a request to prevent double loading
    const [isFiltering, setIsFiltering] = useState(false);
    const [isInitialMount, setIsInitialMount] = useState(true);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Mark that initial mount is complete and sync with URL params
    useEffect(() => {
        // Ensure state is in sync with URL params on mount
        if (!hasInitialized) {
            setSearchTerm(filters.search || '');
            setSelectedClass(filters.classroom_id || '');
            setSelectedGender(filters.gender || '');
            setHasInitialized(true);
        }
        
        // Small delay to ensure all initialization is complete
        const timer = setTimeout(() => {
            setIsInitialMount(false);
        }, 100);
        
        return () => clearTimeout(timer);
    }, [filters, hasInitialized]);
    
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
            render: (row) => (
                <Link 
                    href={route('admin.students.show', row.id)}
                    className="text-indigo-600 hover:text-indigo-900 font-medium"
                >
                    {row.user.name}
                </Link>
            )
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
        
        // Prevent multiple simultaneous requests
        if (isFiltering) return;
        setIsFiltering(true);
        
        // Build clean params object (remove empty values)
        const params = {};
        const currentSearch = searchTerm.trim();
        
        if (currentSearch) params.search = currentSearch;
        if (selectedClass) params.classroom_id = selectedClass;
        if (selectedGender) params.gender = selectedGender;
        
        router.get(route('admin.students.index'), params, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsFiltering(false),
            replace: true // Use replace to avoid adding to history
        });
    };

    const resetFilters = () => {
        if (isFiltering) return;
        setIsFiltering(true);
        
        setSearchTerm('');
        setSelectedClass('');
        setSelectedGender('');
        
        router.get(route('admin.students.index'), {}, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsFiltering(false),
            replace: true // Use replace to avoid adding to history
        });
    };

    // Debounced filter effect - only trigger when user stops typing
    useEffect(() => {
        // Don't filter on initial mount or if already filtering
        if (isInitialMount || isFiltering) return;
        
        // Check if current values are different from URL parameters
        const currentSearch = searchTerm.trim();
        const currentClass = selectedClass;
        const currentGender = selectedGender;
        
        const urlSearch = (filters.search || '').trim();
        const urlClass = filters.classroom_id || '';
        const urlGender = filters.gender || '';
        
        // Only make request if values have actually changed
        const hasRealChanges = currentSearch !== urlSearch || 
                              currentClass !== urlClass || 
                              currentGender !== urlGender;
        
        if (!hasRealChanges) return;
        
        const timer = setTimeout(() => {
            setIsFiltering(true);
            
            // Build clean params object (remove empty values)
            const params = {};
            if (currentSearch) params.search = currentSearch;
            if (currentClass) params.classroom_id = currentClass;
            if (currentGender) params.gender = currentGender;
            
            router.get(route('admin.students.index'), params, {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsFiltering(false),
                replace: true // Use replace to avoid adding to history
            });
        }, 600); // Increased debounce time to reduce API calls

        return () => clearTimeout(timer);
    }, [searchTerm, selectedClass, selectedGender, isInitialMount, isFiltering]);

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
                {/* Quick Actions Card */}
                <Card>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Import Section */}
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-green-100">
                                    <Upload className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Import Students</h3>
                                <p className="mt-1 text-xs text-gray-500">
                                    Upload student data from Excel or CSV files
                                </p>
                                <div className="mt-3">
                                    <Link
                                        href={route('admin.students.import')}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        Start Import
                                    </Link>
                                </div>
                            </div>

                            {/* Export Section */}
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-blue-100">
                                    <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Export Students</h3>
                                <p className="mt-1 text-xs text-gray-500">
                                    Download student data as Excel file
                                </p>
                                <div className="mt-3 space-x-2">
                                    <a
                                        href={route('admin.students.export')}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Export All
                                    </a>
                                </div>
                            </div>

                            {/* Template Section */}
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-gray-100">
                                    <Download className="h-6 w-6 text-gray-600" />
                                </div>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Import Template</h3>
                                <p className="mt-1 text-xs text-gray-500">
                                    Download template with sample data
                                </p>
                                <div className="mt-3">
                                    <a
                                        href={route('admin.students.template')}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    >
                                        Download
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <Users className="h-6 w-6 text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Students Management</h2>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {students.data ? students.data.length : students.length} students
                            </span>
                        </div>
                        <div className="flex items-center space-x-3">
                            {/* Import Button */}
                            <div className="relative group">
                                <Link
                                    href={route('admin.students.import')}
                                    className="inline-flex items-center px-4 py-2 border border-green-300 shadow-sm text-sm font-medium rounded-lg text-green-700 bg-green-50 hover:bg-green-100 hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
                                    title="Import students from Excel/CSV file"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Import Students
                                </Link>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                    Upload student data from Excel/CSV
                                </div>
                            </div>

                            {/* Export Button */}
                            <div className="relative group">
                                <a
                                    href={route('admin.students.export', {
                                        classroom_id: selectedClass,
                                        gender: selectedGender,
                                        search: searchTerm
                                    })}
                                    className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                                    title={`Export ${(selectedClass || selectedGender || searchTerm) ? 'filtered' : 'all'} students to Excel`}
                                >
                                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                                    {(selectedClass || selectedGender || searchTerm) ? (
                                        <>
                                            <Filter className="h-3 w-3 mr-1" />
                                            Export Filtered
                                        </>
                                    ) : (
                                        'Export All'
                                    )}
                                </a>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                    Download {(selectedClass || selectedGender || searchTerm) ? 'filtered' : 'all'} students as Excel
                                </div>
                            </div>

                            {/* Download Template Button */}
                            <div className="relative group">
                                <a
                                    href={route('admin.students.template')}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                                    title="Download import template"
                                >
                                    <Download className="h-4 w-4" />
                                </a>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                    Download template
                                </div>
                            </div>

                            {/* Add Student Button */}
                            <Button
                                as={Link}
                                href={route('admin.students.create')}
                                variant="primary"
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 transition-all duration-200"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Student
                            </Button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50"
                                disabled={isFiltering}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                                </svg>
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                                {isFiltering && (
                                    <div className="ml-2 animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600"></div>
                                )}
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
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        placeholder="Search by name, email, or admission number..."
                                    />
                                </div>

                                <div>
                                    <label htmlFor="classroom" className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                    <select
                                        id="classroom"
                                        value={selectedClass}
                                        onChange={(e) => setSelectedClass(e.target.value)}
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
                                        onChange={(e) => setSelectedGender(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    >
                                        <option value="">All Genders</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>

                                <div className="md:col-span-3 flex justify-end">
                                    <Button
                                        onClick={resetFilters}
                                        variant="secondary"
                                        disabled={isFiltering}
                                    >
                                        {isFiltering ? 'Resetting...' : 'Reset Filters'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Filter Status Indicator */}
                        {(selectedClass || selectedGender || searchTerm) && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Filter className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-800">
                                            Active Filters:
                                        </span>
                                        <div className="flex items-center space-x-2">
                                            {searchTerm && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Search: "{searchTerm}"
                                                </span>
                                            )}
                                            {selectedClass && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Class: {classrooms.find(c => c.id == selectedClass)?.name}
                                                </span>
                                            )}
                                            {selectedGender && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Gender: {selectedGender.charAt(0).toUpperCase() + selectedGender.slice(1)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm text-blue-600">
                                            {students.data ? students.data.length : students.length} students found
                                        </span>
                                        <button
                                            onClick={resetFilters}
                                            className="inline-flex items-center px-2 py-1 border border-blue-300 rounded-md text-xs font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <Table
                        columns={columns}
                        data={students.data}
                        actions={(row) => (
                            <div className="flex items-center space-x-3">
                                <Button
                                    as={Link}
                                    href={route('admin.students.show', row.id)}
                                    variant="secondary"
                                    size="sm"
                                    className="p-2"
                                    title="View Details"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                    as={Link}
                                    href={route('admin.students.edit', row.id)}
                                    variant="primary"
                                    size="sm"
                                    className="p-2"
                                    title="Edit Student"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    onClick={() => handleDelete(row.id)}
                                    variant="danger"
                                    size="sm"
                                    className="p-2"
                                    title="Delete Student"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                        pagination={students}
                    />
                </Card>

                {/* Floating Action Menu */}
                <div className="fixed bottom-6 right-6 z-50">
                    <div className="flex flex-col items-end space-y-3">
                        {/* Quick Import Button */}
                        <div className="group relative">
                            <Link
                                href={route('admin.students.import')}
                                className="flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                                title="Quick Import"
                            >
                                <Upload className="h-6 w-6" />
                            </Link>
                            <div className="absolute right-14 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                Import Students
                            </div>
                        </div>

                        {/* Quick Export Button */}
                        <div className="group relative">
                            <a
                                href={route('admin.students.export', {
                                    classroom_id: selectedClass,
                                    gender: selectedGender,
                                    search: searchTerm
                                })}
                                className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                                title="Quick Export"
                            >
                                <FileSpreadsheet className="h-6 w-6" />
                            </a>
                            <div className="absolute right-14 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                Export Students
                            </div>
                        </div>

                        {/* Add Student Button */}
                        <div className="group relative">
                            <Link
                                href={route('admin.students.create')}
                                className="flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                                title="Add New Student"
                            >
                                <Plus className="h-8 w-8" />
                            </Link>
                            <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                Add Student
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
