import { Head, useForm, Link, router, usePage } from '@inertiajs/react';
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
import SearchableSelect from '@/Components/SearchableSelect';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

export default function ReportCards({ auth, students, terms, classrooms, filters = {} }) {

    const [showFilters, setShowFilters] = useState(true);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        term_id: '',
        classroom_id: filters.classroom_id || '',
    });

    const { flash } = usePage().props;

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
                    {/* Flash Error Message */}
                    {flash?.error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <p className="text-sm text-red-700 mt-1">{flash.error}</p>
                            </div>
                        </div>
                    )}

                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Report Cards</h1>
                            <p className="text-gray-600">Generate and download student report cards</p>
                        </div>
                        {hasActiveFilters && (
                            <Button
                                onClick={clearFilters}
                                variant="secondary"
                                className="inline-flex items-center"
                            >
                                <XMarkIcon className="h-4 w-4 mr-2" />
                                Clear Filter
                            </Button>
                        )}
                    </div>

                    {/* Generate Report Card Form - Combined */}
                    <Card className="max-w-xl overflow-visible">
                        <div className="p-6 overflow-visible">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                <PrinterIcon className="h-5 w-5 mr-2" />
                                Generate Report Card
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Classroom Filter */}
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
                                    <p className="text-xs text-gray-500 mt-1">
                                        {students.length} student{students.length !== 1 ? 's' : ''} available
                                        {hasActiveFilters && ' (filtered)'}
                                    </p>
                                </div>

                                {/* Student Selection */}
                                <div>
                                    <FormLabel htmlFor="student_id">Student</FormLabel>
                                    <SearchableSelect
                                        options={students?.map(student => ({
                                            id: student.id,
                                            name: `${student?.user?.name || 'Unknown Student'} (${student?.admission_number || 'N/A'})`
                                        })) || []}
                                        value={data.student_id}
                                        onChange={(value) => setData('student_id', value)}
                                        placeholder="Search and select student..."
                                        displayValue={(option) => option.name}
                                        emptyMessage="No students found"
                                        className="mt-1"
                                    />
                                    {errors.student_id && (
                                        <div className="text-red-500 text-sm mt-1">{errors.student_id}</div>
                                    )}
                                </div>

                                {/* Term Selection */}
                                <div>
                                    <FormLabel htmlFor="term_id">Term</FormLabel>
                                    <SearchableSelect
                                        options={terms?.map(term => ({
                                            id: term.id,
                                            name: `${(term?.academicSession || term?.academic_session)?.name || 'Unknown Session'} - ${term?.name || 'Unknown Term'}`
                                        })) || []}
                                        value={data.term_id}
                                        onChange={(value) => setData('term_id', value)}
                                        placeholder="Search and select term..."
                                        displayValue={(option) => option.name}
                                        emptyMessage="No terms found"
                                        className="mt-1"
                                    />
                                    {errors.term_id && (
                                        <div className="text-red-500 text-sm mt-1">{errors.term_id}</div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="pt-2">
                                    <Button type="submit" disabled={processing || !data.student_id || !data.term_id} className="w-full">
                                        <PrinterIcon className="h-4 w-4 mr-2" />
                                        {processing ? 'Generating...' : 'Generate PDF Report Card'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
