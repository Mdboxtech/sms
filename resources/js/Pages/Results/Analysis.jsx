import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import { ArrowLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ResultsAnalysis({ auth, results, statistics }) {
    const [subjectPerformance, setSubjectPerformance] = useState([]);
    const [gradeDistribution, setGradeDistribution] = useState({});
    const [topPerformers, setTopPerformers] = useState([]);

    useEffect(() => {
        if (results && results.length > 0) {
            // Calculate subject performance
            const subjectData = {};
            results.forEach(result => {
                const subjectName = result.subject?.name || 'Unknown';
                if (!subjectData[subjectName]) {
                    subjectData[subjectName] = {
                        totalScore: 0,
                        count: 0
                    };
                }
                subjectData[subjectName].totalScore += parseFloat(result.total_score || 0);
                subjectData[subjectName].count += 1;
            });

            const subjectPerformanceData = Object.keys(subjectData).map(subject => ({
                subject,
                averageScore: (subjectData[subject].totalScore / subjectData[subject].count).toFixed(1)
            }));

            setSubjectPerformance(subjectPerformanceData.sort((a, b) => b.averageScore - a.averageScore));

            // Calculate grade distribution
            const grades = { A: 0, B: 0, C: 0, D: 0, F: 0 };
            results.forEach(result => {
                const score = parseFloat(result.total_score || 0);
                if (score >= 70) grades.A += 1;
                else if (score >= 60) grades.B += 1;
                else if (score >= 50) grades.C += 1;
                else if (score >= 40) grades.D += 1;
                else grades.F += 1;
            });
            setGradeDistribution(grades);

            // Find top performers
            const studentPerformance = {};
            results.forEach(result => {
                const studentId = result.student?.id;
                const studentName = result.student?.user?.name || 'Unknown Student';
                if (!studentId) return;

                if (!studentPerformance[studentId]) {
                    studentPerformance[studentId] = {
                        id: studentId,
                        name: studentName,
                        classroom: result.student?.classroom?.name || 'Unknown Class',
                        totalScore: 0,
                        count: 0
                    };
                }
                studentPerformance[studentId].totalScore += parseFloat(result.total_score || 0);
                studentPerformance[studentId].count += 1;
            });

            const topPerformersData = Object.values(studentPerformance)
                .map(student => ({
                    ...student,
                    averageScore: (student.totalScore / student.count).toFixed(1)
                }))
                .sort((a, b) => b.averageScore - a.averageScore)
                .slice(0, 5);

            setTopPerformers(topPerformersData);
        }
    }, [results]);

    const pieChartData = {
        labels: ['A (70-100)', 'B (60-69)', 'C (50-59)', 'D (40-49)', 'F (0-39)'],
        datasets: [
            {
                data: [
                    gradeDistribution.A || 0,
                    gradeDistribution.B || 0,
                    gradeDistribution.C || 0,
                    gradeDistribution.D || 0,
                    gradeDistribution.F || 0
                ],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(255, 99, 132, 0.6)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1,
            },
        ],
    };

    const barChartData = {
        labels: subjectPerformance.map(item => item.subject),
        datasets: [
            {
                label: 'Average Score (%)',
                data: subjectPerformance.map(item => item.averageScore),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const barChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Average Score by Subject',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
            },
        },
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader>Results Analysis</PageHeader>}
        >
            <Head title="Results Analysis - SMS" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex justify-between items-center">
                        <Link
                            href={route('admin.results.index')}
                            className="inline-flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to Results
                        </Link>

                        <Link
                            href={route('admin.results.export')}
                            className="inline-flex items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                        >
                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                            Export All Results
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <Card>
                            <div className="p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Total Results</h2>
                                <p className="text-3xl font-bold text-indigo-600">{statistics.total_results}</p>
                            </div>
                        </Card>
                        <Card>
                            <div className="p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Average Score</h2>
                                <p className="text-3xl font-bold text-indigo-600">{statistics.average_score?.toFixed(1) || 0}%</p>
                            </div>
                        </Card>
                        <Card>
                            <div className="p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Pass Rate</h2>
                                <p className="text-3xl font-bold text-indigo-600">{statistics.pass_rate?.toFixed(1) || 0}%</p>
                            </div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card>
                            <div className="p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Grade Distribution</h2>
                                <div className="h-64">
                                    <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
                                </div>
                            </div>
                        </Card>
                        <Card>
                            <div className="p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Score Range</h2>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-700">Highest Score</span>
                                            <span className="text-sm font-medium text-gray-700">{statistics.highest_score || 0}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${statistics.highest_score || 0}%` }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-700">Average Score</span>
                                            <span className="text-sm font-medium text-gray-700">{statistics.average_score?.toFixed(1) || 0}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${statistics.average_score || 0}%` }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-700">Lowest Score</span>
                                            <span className="text-sm font-medium text-gray-700">{statistics.lowest_score || 0}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${statistics.lowest_score || 0}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 gap-6 mb-6">
                        <Card>
                            <div className="p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Subject Performance</h2>
                                <div className="h-80">
                                    {subjectPerformance.length > 0 ? (
                                        <Bar data={barChartData} options={barChartOptions} />
                                    ) : (
                                        <p className="text-gray-500 text-center mt-10">No subject data available</p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Card>
                        <div className="p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Top Performing Students</h2>
                            {topPerformers.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Rank
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Student Name
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Class
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Average Score
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {topPerformers.map((student, index) => (
                                                <tr key={student.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{index + 1}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">{student.classroom}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{student.averageScore}%</div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center">No student data available</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}