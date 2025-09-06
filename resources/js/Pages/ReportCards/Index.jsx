import { Head, useForm, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader, FormLabel, FormSelect, Button } from '@/Components/UI';
import { 
    DocumentArrowDownIcon,
    EyeIcon,
    AcademicCapIcon,
    FunnelIcon,
    PrinterIcon,
    MagnifyingGlassIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export default function ReportCards({ auth, students, terms, classrooms, filters = {} }) {

    const [showFilters, setShowFilters] = useState(true);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        term_id: '',
        classroom_id: filters.classroom_id || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!data.student_id || !data.term_id) {
            alert('Please select both student and term.');
            return;
        }

        // Find the student to get classroom info
        const student = students.find(s => s.id == data.student_id);
        const classroomId = student?.classroom_id;

        if (!classroomId) {
            alert('Student classroom information is missing.');
            return;
        }

        // Generate report card using the admin route
        const url = route('admin.reports.student-report-card', {
            student: data.student_id,
            term: data.term_id,
            classroom: classroomId
        });
        
        window.open(url, '_blank');
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        
        // Remove empty filters
        Object.keys(newFilters).forEach(k => {
            if (!newFilters[k]) {
                delete newFilters[k];
            }
        });

        router.get(route('admin.report-cards.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        handleFilterChange('search', searchTerm);
    };

    const clearFilters = () => {
        setSearchTerm('');
        router.get(route('admin.report-cards.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hasActiveFilters = Object.keys(filters).some(key => filters[key] && filters[key] !== '');

    const generateBulkReports = () => {
        if (!data.term_id) {
            alert('Please select a term first.');
            return;
        }
        // This could be implemented later for bulk generation
        alert('Bulk report generation feature coming soon!');
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader>Report Cards</PageHeader>}
        >
            <Head title="Report Cards" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Report Cards</h1>
                            <p className="text-gray-600">Generate and download student report cards</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            {hasActiveFilters && (
                                <Button
                                    onClick={clearFilters}
                                    variant="secondary"
                                    className="inline-flex items-center"
                                >
                                    <XMarkIcon className="h-4 w-4 mr-2" />
                                    Clear Filters
                                </Button>
                            )}
                            <Button
                                onClick={() => setShowFilters(!showFilters)}
                                variant="secondary"
                                className="inline-flex items-center"
                            >
                                <FunnelIcon className="h-4 w-4 mr-2" />
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <Card className="mb-6">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <FunnelIcon className="h-5 w-5 mr-2" />
                                    Filter & Search Students
                                </h3>
                                
                                {/* Search Bar */}
                                <form onSubmit={handleSearch} className="mb-4">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search by student name or admission number..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                        {searchTerm && (
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSearchTerm('');
                                                        handleFilterChange('search', '');
                                                    }}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <XMarkIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </form>

                                {/* Filter Dropdowns */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <FormLabel htmlFor="filter_classroom">Classroom</FormLabel>
                                        <FormSelect
                                            id="filter_classroom"
                                            value={filters.classroom_id || ''}
                                            onChange={(e) => handleFilterChange('classroom_id', e.target.value)}
                                        >
                                            <option value="">All Classrooms</option>
                                            {classrooms?.map((classroom) => (
                                                <option key={classroom.id} value={classroom.id}>
                                                    {classroom.name}
                                                </option>
                                            ))}
                                        </FormSelect>
                                    </div>

                                    <div>
                                        <FormLabel htmlFor="filter_term">Term (for bulk actions)</FormLabel>
                                        <FormSelect
                                            id="filter_term"
                                            value={filters.term_id || ''}
                                            onChange={(e) => handleFilterChange('term_id', e.target.value)}
                                        >
                                            <option value="">All Terms</option>
                                            {terms?.map((term) => (
                                                <option key={term.id} value={term.id}>
                                                    {term?.academicSession?.name || 'Unknown Session'} - {term?.name || 'Unknown Term'}
                                                </option>
                                            ))}
                                        </FormSelect>
                                    </div>

                                    <div className="flex items-end">
                                        <div className="w-full">
                                            <FormLabel>&nbsp;</FormLabel>
                                            <div className="text-sm text-gray-600">
                                                {students.length} student{students.length !== 1 ? 's' : ''} found
                                                {hasActiveFilters && ' (filtered)'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Generate Report Card Form */}
                        <Card>
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <PrinterIcon className="h-5 w-5 mr-2" />
                                    Generate Report Card
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <FormLabel htmlFor="student_id">Student</FormLabel>
                                        <FormSelect
                                            id="student_id"
                                            name="student_id"
                                            value={data.student_id}
                                            onChange={(e) => setData('student_id', e.target.value)}
                                            className="mt-1 block w-full"
                                        >
                                            <option value="">Select Student</option>
                                            {students?.map((student) => (
                                                <option key={student.id} value={student.id}>
                                                    {student?.user?.name || 'Unknown Student'} ({student?.admission_number || 'N/A'}) - {student?.classroom?.name || 'No Class'}
                                                </option>
                                            ))}
                                        </FormSelect>
                                        {errors.student_id && (
                                            <div className="text-red-500 text-sm mt-1">{errors.student_id}</div>
                                        )}
                                    </div>

                                    <div>
                                        <FormLabel htmlFor="term_id">Term</FormLabel>
                                        <FormSelect
                                            id="term_id"
                                            name="term_id"
                                            value={data.term_id}
                                            onChange={(e) => setData('term_id', e.target.value)}
                                            className="mt-1 block w-full"
                                        >
                                            <option value="">Select Term</option>
                                            {terms?.map((term) => (
                                                <option key={term?.id} value={term?.id}>
                                                    {term?.academicSession?.name || 'Unknown Session'} - {term?.name || 'Unknown Term'}
                                                </option>
                                            ))}
                                        </FormSelect>
                                        {errors.term_id && (
                                            <div className="text-red-500 text-sm mt-1">{errors.term_id}</div>
                                        )}
                                    </div>

                                    <div className="flex space-x-3">
                                        <Button type="submit" disabled={processing || !data.student_id || !data.term_id}>
                                            <PrinterIcon className="h-4 w-4 mr-2" />
                                            {processing ? 'Generating...' : 'Generate PDF Report Card'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <AcademicCapIcon className="h-5 w-5 mr-2" />
                                    Quick Actions
                                </h2>
                                <div className="space-y-4">
                                    <div className="border rounded-lg p-4">
                                        <h3 className="font-medium text-gray-900 mb-2">Recent Students</h3>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {students.slice(0, 10).map((student) => (
                                                <div key={student.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {student.user?.name || 'Unknown Student'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {student.admission_number} - {student.classroom?.name || 'No Class'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => setData('student_id', student.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 text-sm px-2 py-1 rounded hover:bg-indigo-50"
                                                    >
                                                        Select
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border rounded-lg p-4">
                                        <h3 className="font-medium text-gray-900 mb-2">Available Terms</h3>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {terms.map((term) => (
                                                <div key={term.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {term?.academicSession?.name || 'Unknown Session'} - {term?.name || 'Unknown Term'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {term.is_current ? 'Current Term' : 'Previous Term'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => setData('term_id', term.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 text-sm px-2 py-1 rounded hover:bg-indigo-50"
                                                    >
                                                        Select
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Bulk Actions */}
                                    <div className="border rounded-lg p-4">
                                        <h3 className="font-medium text-gray-900 mb-2">Bulk Actions</h3>
                                        <Button
                                            onClick={generateBulkReports}
                                            variant="secondary"
                                            className="w-full"
                                            disabled={!data.term_id}
                                        >
                                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                                            Generate All Reports for Term
                                        </Button>
                                        {!data.term_id && (
                                            <p className="text-xs text-gray-500 mt-1">Select a term first</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
