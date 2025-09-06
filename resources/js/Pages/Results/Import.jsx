import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import { 
    ArrowLeftIcon,
    CloudArrowUpIcon, 
    DocumentArrowDownIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function ImportResults({ auth, terms, classrooms, subjects }) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null,
        term_id: ''
    });

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        // Validate file type
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];
        
        if (!allowedTypes.includes(file.type)) {
            alert('Please select a valid Excel file (.xlsx, .xls) or CSV file');
            return;
        }

        setSelectedFile(file);
        setData('file', file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!data.file || !data.term_id) {
            alert('Please select both a file and a term');
            return;
        }

        post(route('admin.results.import.process'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setSelectedFile(null);
            }
        });
    };

    const downloadTemplate = () => {
        if (!data.term_id) {
            alert('Please select a term first');
            return;
        }
        
        window.location.href = route('admin.results.download-template', { term_id: data.term_id });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Import Results - SMS" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <PageHeader 
                        title="Import Results"
                        subtitle="Upload results data from Excel or CSV files"
                        action={
                            <Link
                                href={route('admin.results.index')}
                                className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back to Results
                            </Link>
                        }
                    />

                    <div className="space-y-6">
                        {/* Instructions Card */}
                        <Card>
                            <div className="p-6">
                                <div className="flex items-start">
                                    <InformationCircleIcon className="h-6 w-6 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Instructions</h3>
                                        <div className="text-gray-600 space-y-2">
                                            <p>1. Download the template for the selected term to see the required format</p>
                                            <p>2. Fill in your results data following the exact column headers</p>
                                            <p>3. Save your file as Excel (.xlsx) or CSV format</p>
                                            <p>4. Upload the file using the form below</p>
                                        </div>
                                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                            <div className="flex items-center">
                                                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                                                <span className="text-sm text-yellow-800">
                                                    Make sure all required fields are filled and student/subject data exists in the system
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Import Form */}
                        <Card>
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900">Upload Results</h3>
                                
                                {/* Term Selection */}
                                <div>
                                    <label htmlFor="term_id" className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Term *
                                    </label>
                                    <select
                                        id="term_id"
                                        value={data.term_id}
                                        onChange={(e) => setData('term_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Choose a term...</option>
                                        {terms.map(term => (
                                            <option key={term.id} value={term.id}>
                                                {term.name} - {term.academic_session.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.term_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.term_id}</p>
                                    )}
                                </div>

                                {/* Download Template */}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={downloadTemplate}
                                        disabled={!data.term_id}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                                        Download Template
                                    </button>
                                </div>

                                {/* File Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Upload File *
                                    </label>
                                    
                                    <div
                                        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                            dragActive 
                                                ? 'border-blue-400 bg-blue-50' 
                                                : selectedFile 
                                                    ? 'border-green-400 bg-green-50'
                                                    : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            accept=".xlsx,.xls,.csv"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        
                                        <div className="space-y-2">
                                            {selectedFile ? (
                                                <>
                                                    <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
                                                    <div className="text-sm">
                                                        <p className="font-medium text-green-700">{selectedFile.name}</p>
                                                        <p className="text-green-600">
                                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                    <div className="text-sm">
                                                        <p className="font-medium text-gray-900">
                                                            Drag and drop your file here, or click to browse
                                                        </p>
                                                        <p className="text-gray-600">
                                                            Supports Excel (.xlsx, .xls) and CSV files
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {errors.file && (
                                        <p className="mt-1 text-sm text-red-600">{errors.file}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing || !data.file || !data.term_id}
                                        className="inline-flex items-center px-6 py-3 bg-blue-600 border border-transparent rounded-md font-semibold text-sm text-white tracking-wider hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Importing...
                                            </>
                                        ) : (
                                            <>
                                                <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                                                Import Results
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </Card>

                        {/* Sample Data Card */}
                        <Card>
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Data Format</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full table-auto border-collapse border border-gray-300">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                                                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">CA Score</th>
                                                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Exam Score</th>
                                                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Remark</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">STU001</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">Mathematics</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">30</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">65</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">Good performance</td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">STU002</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">English</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">25</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">70</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">Excellent work</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
