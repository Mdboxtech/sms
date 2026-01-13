import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Card from '@/Components/UI/Card';
import StatCard from '@/Components/UI/StatCard';
import Table from '@/Components/UI/Table';
import { 
    Users, 
    GraduationCap, 
    BookOpen,
    FileText 
} from 'lucide-react';

export default function Dashboard({ 
    auth, 
    metrics = {}, 
    recent_results = [], 
    class_distribution = [], 
    latest_activities = [], 
    my_classes = [], 
    my_subjects = [], 
    student_info = {}, 
    result_history = {} 
}) {
    const resultColumns = [
        { key: 'student', label: 'Student', render: (row) => row.student?.user?.name || 'N/A' },
        { key: 'subject', label: 'Subject', render: (row) => row.subject?.name || 'N/A' },
        { key: 'total_score', label: 'Score' },
        { 
            key: 'created_at', 
            label: 'Date', 
            render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A'
        }
    ];

    const studentResultColumns = [
        { key: 'subject', label: 'Subject', render: (row) => row.subject?.name || 'N/A' },
        { key: 'ca_score', label: 'CA Score' },
        { key: 'exam_score', label: 'Exam Score' },
        { key: 'total_score', label: 'Total Score' },
        { 
            key: 'term', 
            label: 'Term', 
            render: (row) => {
                if (row.term) {
                    const sessionName = row.term.academicSession?.name || 'N/A';
                    return `${row.term.name} - ${sessionName}`;
                }
                return 'N/A';
            }
        }
    ];

    return (
        <AuthenticatedLayout>
            <Head>
                <title>Dashboard - SMS</title>
            </Head>

            <div className="space-y-6">
                {/* Stats Section */}
                {auth.user.role === 'admin' && (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total Students"
                            value={metrics.total_students || 0}
                            icon={Users}
                        />
                        <StatCard
                            title="Total Classes"
                            value={metrics.total_classes || 0}
                            icon={GraduationCap}
                        />
                        <StatCard
                            title="Total Subjects"
                            value={metrics.total_subjects || 0}
                            icon={BookOpen}
                        />
                        <StatCard
                            title="Total Results"
                            value={metrics.total_results || 0}
                            icon={FileText}
                        />
                    </div>
                )}

                {auth.user.role === 'teacher' && (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="My Classes"
                            value={metrics.my_classes || 0}
                            icon={GraduationCap}
                        />
                        <StatCard
                            title="My Subjects"
                            value={metrics.my_subjects || 0}
                            icon={BookOpen}
                        />
                        <StatCard
                            title="Total Students"
                            value={metrics.total_students || 0}
                            icon={Users}
                        />
                        <StatCard
                            title="Pending Results"
                            value={metrics.pending_results || 0}
                            icon={FileText}
                        />
                    </div>
                )}

                {auth.user.role === 'student' && (
                    <Card>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Class</h3>
                                <p className="mt-1 text-lg font-semibold text-gray-900">{student_info.classroom || 'N/A'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Admission Number</h3>
                                <p className="mt-1 text-lg font-semibold text-gray-900">{student_info.admission_number || 'N/A'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Current Term</h3>
                                <p className="mt-1 text-lg font-semibold text-gray-900">{student_info.current_term || 'N/A'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Academic Session</h3>
                                <p className="mt-1 text-lg font-semibold text-gray-900">{student_info.current_session || 'N/A'}</p>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Main Content */}
                {auth.user.role === 'admin' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Recent Results */}
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Recent Results</h2>
                            </div>
                            <Table
                                columns={resultColumns}
                                data={recent_results}
                            />
                        </Card>

                        {/* Class Distribution */}
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Class Distribution</h2>
                            </div>
                            <div className="space-y-4">
                                {class_distribution.length > 0 ? (
                                    class_distribution.map((classroom) => (
                                        <div key={classroom.name} className="flex items-center">
                                            <span className="flex-1 text-sm font-medium text-gray-600">
                                                {classroom.name}
                                            </span>
                                            <div className="ml-4 flex-1">
                                                <div className="relative h-2 bg-gray-200 rounded-full">
                                                    <div
                                                        className="absolute h-2 bg-indigo-600 rounded-full"
                                                        style={{
                                                            width: `${(classroom.student_count / Math.max(...class_distribution.map(c => c.student_count))) * 100}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="ml-4 text-sm font-medium text-gray-600">
                                                {classroom.student_count} students
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No class distribution data available</p>
                                )}
                            </div>
                        </Card>
                    </div>
                )}

                {auth.user.role === 'teacher' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* My Classes */}
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">My Classes</h2>
                            </div>
                            <div className="space-y-4">
                                {my_classes.length > 0 ? (
                                    my_classes.map((classroom) => (
                                        <div key={classroom.id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-medium text-gray-900">{classroom.name}</h3>
                                                <span className="text-sm text-gray-500">
                                                    {classroom.students?.length || 0} students
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                                {classroom.students && classroom.students.slice(0, 8).map((student) => (
                                                    <div key={student.id} className="text-sm text-gray-600">
                                                        {student.user?.name || 'Unknown'}
                                                    </div>
                                                ))}
                                                {classroom.students && classroom.students.length > 8 && (
                                                    <div className="text-sm text-indigo-600">
                                                        +{classroom.students.length - 8} more
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No classes assigned</p>
                                )}
                            </div>
                        </Card>

                        {/* Recent Results */}
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Recent Results</h2>
                            </div>
                            <Table
                                columns={resultColumns}
                                data={recent_results}
                            />
                        </Card>
                    </div>
                )}

                {auth.user.role === 'student' && (
                    <div className="space-y-6">
                        {/* Current Term Results */}
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Current Term Results</h2>
                            </div>
                            <Table
                                columns={studentResultColumns}
                                data={student_info.current_results || []}
                            />
                        </Card>

                        {/* Result History */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {Object.entries(result_history).map(([term, results]) => (
                                <Card key={term}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold text-gray-900">{term}</h2>
                                    </div>
                                    <Table
                                        columns={studentResultColumns}
                                        data={results}
                                    />
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Activities */}
                {(auth.user.role === 'admin' || auth.user.role === 'teacher') && (
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Latest Activities</h2>
                        </div>
                        <div className="flow-root">
                            <ul role="list" className="-mb-8">
                                {latest_activities.length > 0 ? (
                                    latest_activities.map((activity, activityIdx) => (
                                        <li key={`${activity.date}-${activityIdx}`}>
                                            <div className="relative pb-8">
                                                {activityIdx !== latest_activities.length - 1 ? (
                                                    <span
                                                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                                        aria-hidden="true"
                                                    />
                                                ) : null}
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                                            <FileText className="h-5 w-5 text-indigo-600" />
                                                        </span>
                                                    </div>
                                                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                        <div>
                                                            <p className="text-sm text-gray-600">{activity.message}</p>
                                                        </div>
                                                        <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                                            {activity.date ? new Date(activity.date).toLocaleDateString() : 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <li>
                                        <p className="text-gray-500 text-center py-4">No recent activities</p>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
