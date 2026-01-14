import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/UI/Button';
import Card from '@/Components/UI/Card';
import { FormSelect, FormLabel } from '@/Components/UI';
import { Upload, Download, FileSpreadsheet, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

export default function Import({ auth, subjects, flash }) {
    const [dragActive, setDragActive] = useState(false);
    const [fileName, setFileName] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        file: null,
        subject_id: '',
    });

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setData('file', file);
            setFileName(file.name);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('file', file);
            setFileName(file.name);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.cbt.questions.import.process'), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Link href={route('admin.cbt.questions.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Import Questions from CSV
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title="Import Questions" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Success/Error Messages */}
                    {flash?.success && (
                        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            {flash.success}
                        </div>
                    )}

                    {flash?.import_errors && flash.import_errors.length > 0 && (
                        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                            <div className="flex items-center mb-2">
                                <AlertCircle className="w-5 h-5 mr-2" />
                                <span className="font-medium">Some rows had errors:</span>
                            </div>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {flash.import_errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Instructions Card */}
                    <Card className="mb-6 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <FileSpreadsheet className="w-5 h-5 mr-2 text-blue-600" />
                            Import Instructions
                        </h3>
                        <div className="text-sm text-gray-600 space-y-2">
                            <p>1. Download the template CSV file using the button below.</p>
                            <p>2. Fill in your questions following the template format.</p>
                            <p>3. Select the target subject for the questions.</p>
                            <p>4. Upload the filled CSV file.</p>
                        </div>

                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-2">CSV Column Format:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li><code className="bg-gray-200 px-1 rounded">question_text</code> - The question (required)</li>
                                <li><code className="bg-gray-200 px-1 rounded">question_type</code> - multiple_choice, true_false, essay, fill_blank</li>
                                <li><code className="bg-gray-200 px-1 rounded">difficulty_level</code> - easy, medium, hard</li>
                                <li><code className="bg-gray-200 px-1 rounded">marks</code> - Points for the question</li>
                                <li><code className="bg-gray-200 px-1 rounded">option_a, option_b, option_c, option_d</code> - Answer options</li>
                                <li><code className="bg-gray-200 px-1 rounded">correct_answer</code> - A, B, C, D (for multiple choice) or True/False</li>
                                <li><code className="bg-gray-200 px-1 rounded">explanation</code> - Optional explanation</li>
                            </ul>
                        </div>

                        <div className="mt-4">
                            <a href={route('admin.cbt.questions.template')}>
                                <Button variant="outline">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Template
                                </Button>
                            </a>
                        </div>
                    </Card>

                    {/* Upload Form */}
                    <Card className="p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                {/* Subject Selection */}
                                <div>
                                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                        Target Subject *
                                    </FormLabel>
                                    <FormSelect
                                        value={data.subject_id}
                                        onChange={(e) => setData('subject_id', e.target.value)}
                                        className="w-full"
                                        required
                                    >
                                        <option value="">Select Subject</option>
                                        {subjects.map((subject) => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.name}
                                            </option>
                                        ))}
                                    </FormSelect>
                                    {errors.subject_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.subject_id}</p>
                                    )}
                                </div>

                                {/* File Upload */}
                                <div>
                                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                        CSV File *
                                    </FormLabel>
                                    <div
                                        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${dragActive
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            type="file"
                                            accept=".csv,.txt,.xlsx,.xls"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                        {fileName ? (
                                            <p className="text-sm text-gray-900 font-medium">{fileName}</p>
                                        ) : (
                                            <>
                                                <p className="text-sm text-gray-600">
                                                    Drag and drop your CSV file here, or click to browse
                                                </p>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    Supports CSV, TXT, XLS, XLSX (Max 10MB)
                                                </p>
                                            </>
                                        )}
                                    </div>
                                    {errors.file && (
                                        <p className="mt-1 text-sm text-red-600">{errors.file}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end space-x-3">
                                    <Link href={route('admin.cbt.questions.index')}>
                                        <Button variant="outline" type="button">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        disabled={processing || !data.file || !data.subject_id}
                                    >
                                        {processing ? 'Importing...' : 'Import Questions'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
