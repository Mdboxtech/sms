import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import Button from '@/Components/UI/Button';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Select from '@/Components/UI/Select';
import IdCardTemplate from '@/Components/IdCard/IdCardTemplate';
import {
    PrinterIcon,
    UserGroupIcon,
    AdjustmentsHorizontalIcon,
    SwatchIcon,
    PhotoIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

export default function IdCardIndex({ auth, idCardSettings, classrooms, flash }) {
    const [activeType, setActiveType] = useState('student'); // student or teacher

    // Settings State
    const [settings, setSettings] = useState(
        activeType === 'student' ? idCardSettings.student_template : idCardSettings.teacher_template
    );

    // Users Selection State
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ classroom_id: '' });

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Update local settings when switching types
    useEffect(() => {
        setSettings(activeType === 'student' ? idCardSettings.student_template : idCardSettings.teacher_template);
        // Reset selections when switching type
        setSelectedUsers([]);
        setUsers([]);
        setPage(1);
        fetchUsers(1, activeType === 'student' ? idCardSettings.student_template : idCardSettings.teacher_template);
    }, [activeType]);

    // Fetch users when filters change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers(1);
        }, 500); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [searchTerm, filters, activeType]);

    // Update settings immediately in UI (preview)
    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    // Save Settings to Database
    const { post, processing } = useForm({});

    const saveSettings = () => {
        router.post(route('admin.id-cards.save-template'), {
            type: activeType,
            template: settings
        }, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const fetchUsers = async (pageNumber = 1) => {
        setLoadingUsers(true);
        try {
            const response = await axios.get(route('admin.id-cards.users'), {
                params: {
                    type: activeType,
                    page: pageNumber,
                    search: searchTerm,
                    classroom_id: filters.classroom_id
                }
            });
            setUsers(response.data.data);
            setTotalPages(response.data.last_page);
            setPage(response.data.current_page);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const toggleUserSelection = (user) => {
        if (selectedUsers.find(u => u.id === user.id)) {
            setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const selectAllUsers = () => {
        // If all current page users are selected, deselect them. Otherwise select all current page users.
        const allSelected = users.every(u => selectedUsers.find(su => su.id === u.id));
        if (allSelected) {
            setSelectedUsers(selectedUsers.filter(su => !users.find(u => u.id === su.id)));
        } else {
            // Add users that aren't already selected
            const newUsers = users.filter(u => !selectedUsers.find(su => su.id === u.id));
            setSelectedUsers([...selectedUsers, ...newUsers]);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout>
            <Head title="ID Card Generator" />

            <div className="space-y-6 print:space-y-0">
                <PageHeader
                    title="ID Card Generator"
                    subtitle="Design and print identity cards for students and staff"
                    className="print:hidden"
                >
                    <div className="flex space-x-3">
                        <div className="flex rounded-md shadow-sm">
                            <button
                                onClick={() => setActiveType('student')}
                                className={`px-4 py-2 text-sm font-medium border rounded-l-md ${activeType === 'student'
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                Students
                            </button>
                            <button
                                onClick={() => setActiveType('teacher')}
                                className={`px-4 py-2 text-sm font-medium border rounded-r-md ${activeType === 'teacher'
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                Staff
                            </button>
                        </div>
                    </div>
                </PageHeader>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
                    {/* Sidebar Controls - Hidden when printing */}
                    <div className="lg:col-span-3 space-y-6 print:hidden">
                        <Card>
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-semibold text-gray-800 flex items-center">
                                    <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2 text-indigo-500" />
                                    Customization
                                </h3>
                                <Button size="xs" onClick={saveSettings} disabled={processing}>
                                    {processing ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                            <div className="p-4 space-y-4">
                                {/* Layout */}
                                <div>
                                    <InputLabel value="Layout" />
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                        <button
                                            onClick={() => handleSettingChange('layout', 'portrait')}
                                            className={`px-3 py-2 text-xs border rounded-md text-center ${settings.layout === 'portrait' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-600'}`}
                                        >
                                            Portrait
                                        </button>
                                        <button
                                            onClick={() => handleSettingChange('layout', 'landscape')}
                                            className={`px-3 py-2 text-xs border rounded-md text-center ${settings.layout === 'landscape' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-600'}`}
                                        >
                                            Landscape
                                        </button>
                                    </div>
                                </div>

                                {/* Colors */}
                                <div>
                                    <InputLabel value="Theme Color" />
                                    <div className="flex items-center space-x-2 mt-1">
                                        <input
                                            type="color"
                                            value={settings.theme_color}
                                            onChange={(e) => handleSettingChange('theme_color', e.target.value)}
                                            className="h-9 w-9 p-0 border border-gray-300 rounded overflow-hidden cursor-pointer"
                                        />
                                        <TextInput
                                            value={settings.theme_color}
                                            onChange={(e) => handleSettingChange('theme_color', e.target.value)}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>

                                {/* Texts */}
                                <div>
                                    <InputLabel value="Header Text" />
                                    <TextInput
                                        value={settings.header_text}
                                        onChange={(e) => handleSettingChange('header_text', e.target.value)}
                                        className="w-full mt-1"
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Sub-Header Text" />
                                    <TextInput
                                        value={settings.sub_header_text}
                                        onChange={(e) => handleSettingChange('sub_header_text', e.target.value)}
                                        className="w-full mt-1"
                                    />
                                </div>

                                {/* Toggles */}
                                <div className="space-y-2 pt-2 border-t border-gray-100">
                                    <label className="flex items-center space-x-2 text-sm text-gray-700">
                                        <input type="checkbox" checked={settings.show_photo} onChange={(e) => handleSettingChange('show_photo', e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                                        <span>Show Photo</span>
                                    </label>
                                    <label className="flex items-center space-x-2 text-sm text-gray-700">
                                        <input type="checkbox" checked={settings.show_id} onChange={(e) => handleSettingChange('show_id', e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                                        <span>Show ID Number</span>
                                    </label>
                                    <label className="flex items-center space-x-2 text-sm text-gray-700">
                                        <input type="checkbox" checked={settings.show_expiry} onChange={(e) => handleSettingChange('show_expiry', e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                                        <span>Show Expiry Date</span>
                                    </label>
                                </div>

                                {settings.show_expiry && (
                                    <div>
                                        <InputLabel value="Expiry Date" />
                                        <TextInput
                                            type="text"
                                            placeholder="Dec 2026"
                                            value={settings.expiry_date}
                                            onChange={(e) => handleSettingChange('expiry_date', e.target.value)}
                                            className="w-full mt-1"
                                        />
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* User Selection */}
                        <Card>
                            <div className="p-4 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-800 flex items-center">
                                    <UserGroupIcon className="w-5 h-5 mr-2 text-indigo-500" />
                                    Select Users ({selectedUsers.length})
                                </h3>
                            </div>
                            <div className="p-4 space-y-4">
                                {/* Filters */}
                                <div className="space-y-3">
                                    <TextInput
                                        placeholder="Search name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full text-sm"
                                    />

                                    {activeType === 'student' && (
                                        <Select
                                            value={filters.classroom_id}
                                            onChange={(e) => setFilters({ ...filters, classroom_id: e.target.value })}
                                            className="w-full text-sm"
                                        >
                                            <option value="">All Classes</option>
                                            {classrooms.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </Select>
                                    )}
                                </div>

                                {/* User List */}
                                <div className="border rounded-md max-h-60 overflow-y-auto bg-gray-50">
                                    {loadingUsers ? (
                                        <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
                                    ) : users.length > 0 ? (
                                        <div className="divide-y divide-gray-200">
                                            <div className="p-2 bg-gray-100 flex items-center sticky top-0">
                                                <input
                                                    type="checkbox"
                                                    checked={users.length > 0 && users.every(u => selectedUsers.find(su => su.id === u.id))}
                                                    onChange={selectAllUsers}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500 mr-2"
                                                />
                                                <span className="text-xs font-semibold text-gray-600">Select All (Page)</span>
                                            </div>
                                            {users.map(user => (
                                                <div key={user.id} className="p-2 hover:bg-white flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!selectedUsers.find(u => u.id === user.id)}
                                                        onChange={() => toggleUserSelection(user)}
                                                        className="rounded text-indigo-600 focus:ring-indigo-500 mr-2"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {user.name || user.user?.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {user.admission_number || user.staff_id || 'No ID'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-gray-500 text-sm">No users found.</div>
                                    )}
                                </div>

                                {/* Pagination - Simple */}
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                    <button
                                        disabled={page <= 1}
                                        onClick={() => fetchUsers(page - 1)}
                                        className="text-indigo-600 disabled:text-gray-400"
                                    >
                                        Previous
                                    </button>
                                    <span>Page {page} of {totalPages}</span>
                                    <button
                                        disabled={page >= totalPages}
                                        onClick={() => fetchUsers(page + 1)}
                                        className="text-indigo-600 disabled:text-gray-400"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Preview / Print Area */}
                    <div className="lg:col-span-9">
                        <Card className="min-h-[600px] flex flex-col print:shadow-none print:border-none print:min-h-0">
                            {/* Toolbar */}
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center print:hidden">
                                <h3 className="font-semibold text-gray-800">
                                    Preview & Print
                                </h3>

                                <div className="flex items-center space-x-3">
                                    <span className="text-sm text-gray-500">
                                        {selectedUsers.length} cards selected
                                    </span>
                                    <Button
                                        variant="secondary"
                                        onClick={handlePrint}
                                        disabled={selectedUsers.length === 0}
                                        className="flex items-center"
                                    >
                                        <PrinterIcon className="w-4 h-4 mr-2" />
                                        Print Cards
                                    </Button>
                                </div>
                            </div>

                            {/* Cards Output */}
                            <div className="flex-1 bg-gray-100 p-8 overflow-auto print:bg-white print:p-0 print:overflow-visible">
                                {selectedUsers.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                        <SwatchIcon className="w-16 h-16 mb-4 opacity-50" />
                                        <p>Select users from the sidebar to generate preview</p>
                                        <p className="text-sm mt-2">Customize the design using the tools on the left</p>

                                        {/* Show a dummy preview so the user sees something initially */}
                                        <div className="mt-8 opacity-60 scale-75 origin-top">
                                            <p className="text-center text-xs mb-2 uppercase font-semibold">Template Preview</p>
                                            <IdCardTemplate
                                                user={{ name: 'John Doe', admission_number: 'STD/2024/001', classroom: { name: 'Grade 10' } }}
                                                settings={settings}
                                                type={activeType}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-4 justify-center print:block">
                                        {/* 
                                            We use a CSS Grid layout for printing to ensure they align well on A4 paper.
                                            On screen, we use flex wrap.
                                        */}
                                        <div className="contents print:grid print:grid-cols-2 print:gap-4 print:page-break-inside-avoid">
                                            {selectedUsers.map((user, index) => (
                                                <div key={user.id} className="print:break-inside-avoid">
                                                    <IdCardTemplate
                                                        user={user}
                                                        settings={settings}
                                                        type={activeType}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 1cm;
                        size: A4;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    /* Ensure cards don't split across pages awkwardly */
                    .break-inside-avoid {
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
