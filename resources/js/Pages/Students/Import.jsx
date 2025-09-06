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
    InformationCircleIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';

export default function ImportStudents({ auth, classrooms }) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null
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
        
        if (!data.file) {
            alert('Please select a file');
            return;
        }

        post(route('admin.students.import.process'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setSelectedFile(null);
            }
        });
    };

    const downloadTemplate = () => {
        window.location.href = route('admin.students.template');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Import Students - SMS" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <PageHeader 
                        title="Import Students"
                        subtitle="Upload student data from Excel or CSV files"
                        action={
                            <Link
                                href={route('admin.students.index')}
                                className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back to Students
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
                                            <p>1. Download the template to see the required format</p>
                                            <p>2. Fill in your student data following the exact column headers</p>
                                            <p>3. Make sure class names match existing classrooms in the system</p>
                                            <p>4. Each student must have a unique admission number and email</p>
                                            <p>5. Save your file as Excel (.xlsx) or CSV format</p>
                                            <p>6. Upload the file using the form below</p>
                                        </div>
                                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                            <div className="flex items-center">
                                                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                                                <span className="text-sm text-yellow-800">
                                                    Default password "password" will be assigned to all imported students
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Available Classrooms */}
                        <Card>
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <UserGroupIcon className="h-5 w-5 mr-2" />
                                    Available Classrooms
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {classrooms.map(classroom => (
                                        <div 
                                            key={classroom.id}
                                            className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800 text-center"
                                        >
                                            {classroom.name}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600 mt-3">
                                    Make sure your file uses these exact classroom names in the "Class" column
                                </p>
                            </div>
                        </Card>

                        {/* Import Form */}
                        <Card>
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900">Upload Students</h3>
                                
                                {/* Download Template */}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={downloadTemplate}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
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
                                        disabled={processing || !data.file}
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
                                                Import Students
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
                                                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Admission Number</th>
                                                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                                                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date of Birth</th>
                                                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                                                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parent Name</th>
                                                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parent Phone</th>
                                                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">STU001</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">John Doe</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">john.doe@example.com</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">Grade 10A</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">2005-03-15</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">Male</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">Jane Doe</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">+1234567890</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">123 Main St, City</td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">STU002</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">Mary Smith</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">mary.smith@example.com</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">Grade 10B</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">2005-07-22</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">Female</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">Robert Smith</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">+0987654321</td>
                                                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">456 Oak Ave, Town</td>
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
