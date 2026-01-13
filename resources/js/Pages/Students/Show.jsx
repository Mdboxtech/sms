import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Card from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { ArrowLeft, Pencil, User, Phone, Mail, Calendar, MapPin, GraduationCap, BookOpen } from 'lucide-react';

export default function Show({ student = null }) {
    console.log('Full props:', { student });

    const formatDate = (date) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const calculateAge = (birthDate) => {
        if (!birthDate) return 'N/A';
        try {
            const today = new Date();
            const birth = new Date(birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const monthDifference = today.getMonth() - birth.getMonth();
            
            if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            
            return age;
        } catch (error) {
            return 'N/A';
        }
    };

    if (!student) {
        return (
            <AuthenticatedLayout>
                <Head title="Student Not Found - SMS" />
                <div className="space-y-6">
                    <Card>
                        <div className="p-6 text-center">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Not Found</h2>
                            <p className="text-gray-600 mb-4">The requested student could not be found.</p>
                            <Button
                                as={Link}
                                href={route('admin.students.index')}
                                variant="primary"
                            >
                                Back to Students
                            </Button>
                        </div>
                    </Card>
                </div>
            </AuthenticatedLayout>
        );
    }

    const studentName = student?.user?.name || 'Unknown Student';
    const studentEmail = student?.user?.email || 'N/A';
    const admissionNumber = student?.admission_number || 'N/A';
    const gender = student?.gender || 'N/A';
    const className = student?.classroom?.name || 'N/A';
    const parentName = student?.parent_name || 'N/A';
    const parentPhone = student?.parent_phone || null;
    const address = student?.address || null;
    const results = student?.results || [];

    return (
        <AuthenticatedLayout>
            <Head title={`${studentName} - Student Details - SMS`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            as={Link}
                            href={route('admin.students.index')}
                            variant="secondary"
                            className="flex items-center"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Students
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {studentName}
                            </h1>
                            <p className="text-sm text-gray-500">Student Details</p>
                        </div>
                    </div>
                    <Button
                        as={Link}
                        href={route('admin.students.edit', student.id)}
                        variant="primary"
                        className="flex items-center"
                    >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Student
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Personal Information */}
                    <div className="lg:col-span-2">
                        <Card>
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                        <p className="mt-1 text-sm text-gray-900">{studentName}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <p className="mt-1 text-sm text-gray-900 flex items-center">
                                            <Mail className="h-4 w-4 mr-1" />
                                            {studentEmail}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Admission Number</label>
                                        <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                                            {admissionNumber}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                                        <p className="mt-1 text-sm text-gray-900 capitalize">{gender}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                        <p className="mt-1 text-sm text-gray-900 flex items-center">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            {formatDate(student.date_of_birth)}
                                            {student.date_of_birth && (
                                                <span className="ml-1">
                                                    ({calculateAge(student.date_of_birth)} years old)
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Class</label>
                                        <p className="mt-1 text-sm text-gray-900 flex items-center">
                                            <GraduationCap className="h-4 w-4 mr-1" />
                                            {className}
                                        </p>
                                    </div>
                                    {address && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Address</label>
                                            <p className="mt-1 text-sm text-gray-900 flex items-start">
                                                <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                                                {address}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Academic Performance */}
                        {results.length > 0 && (
                            <Card className="mt-6">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <BookOpen className="h-5 w-5 mr-2" />
                                        Recent Academic Performance
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Subject
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Term
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Score
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Grade
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {results.slice(0, 10).map((result, index) => (
                                                    <tr key={result?.id || index}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {result?.subject?.name || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {result?.term?.name || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {result?.total_score || 0}/100
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                (result?.total_score || 0) >= 70 
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : (result?.total_score || 0) >= 50
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {result?.grade || 'N/A'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {results.length > 10 && (
                                        <div className="mt-4 text-center">
                                            <p className="text-sm text-gray-500">
                                                Showing 10 of {results.length} results
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Parent/Guardian Information */}
                    <div>
                        <Card>
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Parent/Guardian</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Name</label>
                                        <p className="mt-1 text-sm text-gray-900">{parentName}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                                        <p className="mt-1 text-sm text-gray-900 flex items-center">
                                            <Phone className="h-4 w-4 mr-1" />
                                            {parentPhone ? (
                                                <a 
                                                    href={`tel:${parentPhone}`}
                                                    className="text-indigo-600 hover:text-indigo-500"
                                                >
                                                    {parentPhone}
                                                </a>
                                            ) : (
                                                'N/A'
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Quick Stats */}
                        <Card className="mt-6">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Total Results</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {results.length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Account Created</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {formatDate(student?.user?.created_at)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Last Updated</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {formatDate(student?.updated_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="mt-6">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => window.location.href = route('admin.results.index') + '?student_id=' + student.id}
                                        className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        View All Results
                                    </button>
                                    <button
                                        onClick={() => window.location.href = route('admin.attendance.index') + '?student_id=' + student.id}
                                        className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        View Attendance
                                    </button>
                                    <Link
                                        href={route('admin.students.edit', student.id)}
                                        className="block w-full text-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                                    >
                                        Edit Student
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
