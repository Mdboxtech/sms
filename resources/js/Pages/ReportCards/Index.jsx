import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader, FormLabel, FormSelect, Button } from '@/Components/UI';
import { 
    DocumentArrowDownIcon,
    EyeIcon,
    AcademicCapIcon 
} from '@heroicons/react/24/outline';

export default function ReportCards({ auth, students, terms }) {

    console.log(terms);
    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        term_id: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('report-cards.generate'), {
            preserveScroll: true,
            onSuccess: () => {
                // Handle success (e.g., show notification)
            },
        });
    };

    const downloadPDF = (studentId, termId) => {
        const url = route('report-cards.generate', { 
            student_id: studentId, 
            term_id: termId, 
            format: 'pdf' 
        });
        window.open(url, '_blank');
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader>Report Cards</PageHeader>}
        >
            <Head title="Report Cards" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Report Cards</h1>
                        <p className="text-gray-600">Generate and download student report cards</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Generate Report Card Form */}
                        <Card>
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
                                                    {student?.user?.name || 'Unknown Student'} ({student?.admission_number || 'N/A'})
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
                                                    {term?.name || 'No Session'} - {term?.name || 'Unknown Term'}
                                                </option>
                                            ))}
                                        </FormSelect>
                                        {errors.term_id && (
                                            <div className="text-red-500 text-sm mt-1">{errors.term_id}</div>
                                        )}
                                    </div>

                                    <div className="flex space-x-3">
                                        <Button type="submit" disabled={processing}>
                                            <EyeIcon className="h-4 w-4 mr-2" />
                                            {processing ? 'Generating...' : 'Generate Report Card'}
                                        </Button>
                                        {data.student_id && data.term_id && (
                                            <Button
                                                type="button"
                                                onClick={() => downloadPDF(data.student_id, data.term_id)}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                                                Download PDF
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Quick Actions
                                </h2>
                                <div className="space-y-4">
                                    <div className="border rounded-lg p-4">
                                        <h3 className="font-medium text-gray-900 mb-2">Recent Students</h3>
                                        <div className="space-y-2">
                                            {students.slice(0, 5).map((student) => (
                                                <div key={student.id} className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {student.user.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {student.admission_number} - {student.classroom?.name}
                                                        </p>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => setData({ student_id: student.id, term_id: data.term_id })}
                                                            className="text-indigo-600 hover:text-indigo-900 text-sm"
                                                        >
                                                            Select
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border rounded-lg p-4">
                                        <h3 className="font-medium text-gray-900 mb-2">Available Terms</h3>
                                        <div className="space-y-2">
                                            {terms.map((term) => (
                                                <div key={term.id} className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {term?.academicSession?.name || 'Unknown Session'} - {term?.name || 'Unknown Term'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {term.is_current ? 'Current Term' : 'Previous Term'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => setData({ student_id: data.student_id, term_id: term.id })}
                                                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                                                    >
                                                        Select
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
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
