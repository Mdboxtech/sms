import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import Button from '@/Components/UI/Button';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Select from '@/Components/UI/Select';
import IdCardTemplate from '@/Components/IdCard/IdCardTemplate';
import IdCardBack from '@/Components/IdCard/IdCardBack';
import {
    PrinterIcon,
    UserGroupIcon,
    AdjustmentsHorizontalIcon,
    CameraIcon,
    PhotoIcon,
    DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

export default function IdCardIndex({ auth, idCardSettings, classrooms, flash }) {
    const [activeType, setActiveType] = useState('student');
    const [activeTab, setActiveTab] = useState('front'); // front or back

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

    // Photo upload state
    const [uploadingPhoto, setUploadingPhoto] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setSettings(activeType === 'student' ? idCardSettings.student_template : idCardSettings.teacher_template);
        setSelectedUsers([]);
        setUsers([]);
        setPage(1);
        fetchUsers(1);
    }, [activeType]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, filters, activeType]);

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

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
        const allSelected = users.every(u => selectedUsers.find(su => su.id === u.id));
        if (allSelected) {
            setSelectedUsers(selectedUsers.filter(su => !users.find(u => u.id === su.id)));
        } else {
            const newUsers = users.filter(u => !selectedUsers.find(su => su.id === u.id));
            setSelectedUsers([...selectedUsers, ...newUsers]);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const triggerPhotoUpload = (user) => {
        setUploadingPhoto(user);
        fileInputRef.current?.click();
    };

    const handlePhotoSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !uploadingPhoto) return;

        const formData = new FormData();
        formData.append('photo', file);
        formData.append('student_id', uploadingPhoto.student?.id || uploadingPhoto.id);

        try {
            const response = await axios.post(route('admin.id-cards.upload-photo'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setUsers(users.map(u =>
                u.id === uploadingPhoto.id
                    ? { ...u, passport_photo: response.data.photo_url }
                    : u
            ));

            setSelectedUsers(selectedUsers.map(u =>
                u.id === uploadingPhoto.id
                    ? { ...u, passport_photo: response.data.photo_url }
                    : u
            ));
        } catch (error) {
            console.error("Failed to upload photo", error);
            alert('Failed to upload photo. Please try again.');
        } finally {
            setUploadingPhoto(null);
            e.target.value = '';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="ID Card Generator" />

            <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                accept="image/*"
                className="hidden"
            />

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
                    {/* Sidebar Controls */}
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

                            {/* Front/Back Tabs */}
                            <div className="flex border-b border-gray-100">
                                <button
                                    onClick={() => setActiveTab('front')}
                                    className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === 'front' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                                >
                                    Front
                                </button>
                                <button
                                    onClick={() => setActiveTab('back')}
                                    className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === 'back' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                                >
                                    Back
                                </button>
                            </div>

                            <div className="p-4 space-y-4">
                                {activeTab === 'front' ? (
                                    <>
                                        {/* Front Side Settings */}
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
                                    </>
                                ) : (
                                    <>
                                        {/* Back Side Settings */}
                                        <label className="flex items-center space-x-2 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={settings.show_back}
                                                onChange={(e) => handleSettingChange('show_back', e.target.checked)}
                                                className="rounded text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span>Enable Back Side</span>
                                        </label>

                                        {settings.show_back && (
                                            <>
                                                <div>
                                                    <InputLabel value="Back Title" />
                                                    <TextInput
                                                        value={settings.back_title || ''}
                                                        onChange={(e) => handleSettingChange('back_title', e.target.value)}
                                                        className="w-full mt-1"
                                                        placeholder="Terms & Conditions"
                                                    />
                                                </div>
                                                <div>
                                                    <InputLabel value="Back Content" />
                                                    <textarea
                                                        value={settings.back_content || ''}
                                                        onChange={(e) => handleSettingChange('back_content', e.target.value)}
                                                        className="w-full mt-1 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                        rows={4}
                                                        placeholder="1. This card is non-transferable..."
                                                    />
                                                </div>
                                                <div>
                                                    <InputLabel value="Contact Phone" />
                                                    <TextInput
                                                        value={settings.back_contact || ''}
                                                        onChange={(e) => handleSettingChange('back_contact', e.target.value)}
                                                        className="w-full mt-1"
                                                        placeholder="+1 234 567 890"
                                                    />
                                                </div>
                                                <div>
                                                    <InputLabel value="Address" />
                                                    <TextInput
                                                        value={settings.back_address || ''}
                                                        onChange={(e) => handleSettingChange('back_address', e.target.value)}
                                                        className="w-full mt-1"
                                                        placeholder="123 School Street..."
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </>
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
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                        {user.passport_photo ? (
                                                            <img src={user.passport_photo} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs font-bold text-gray-500">
                                                                {user.name?.charAt(0)?.toUpperCase() || '?'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {user.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {user.admission_number || 'No ID'}
                                                        </p>
                                                    </div>
                                                    {activeType === 'student' && !user.passport_photo && (
                                                        <button
                                                            onClick={() => triggerPhotoUpload(user)}
                                                            className="p-1 text-indigo-500 hover:bg-indigo-50 rounded"
                                                            title="Upload Photo"
                                                        >
                                                            <CameraIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-gray-500 text-sm">No users found.</div>
                                    )}
                                </div>

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
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center print:hidden">
                                <h3 className="font-semibold text-gray-800 flex items-center">
                                    <DocumentDuplicateIcon className="w-5 h-5 mr-2 text-indigo-500" />
                                    Preview & Print {settings.show_back && '(Front & Back)'}
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

                            <div className="flex-1 bg-gray-100 p-8 overflow-auto print:bg-white print:p-0 print:overflow-visible print-cards-container">
                                {selectedUsers.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 print:hidden">
                                        <PhotoIcon className="w-16 h-16 mb-4 opacity-50" />
                                        <p>Select users from the sidebar to generate preview</p>
                                        <p className="text-sm mt-2">Customize the design using the tools on the left</p>

                                        <div className="mt-8 opacity-60 scale-90 origin-top flex gap-4">
                                            <div>
                                                <p className="text-center text-xs mb-2 uppercase font-semibold">Front</p>
                                                <IdCardTemplate
                                                    user={{ name: 'John Doe', admission_number: 'STD/2024/001', classroom: { name: 'Grade 10' } }}
                                                    settings={settings}
                                                    type={activeType}
                                                />
                                            </div>
                                            {settings.show_back && (
                                                <div>
                                                    <p className="text-center text-xs mb-2 uppercase font-semibold">Back</p>
                                                    <IdCardBack settings={settings} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-8 print:space-y-0">
                                        {selectedUsers.map((user) => (
                                            <div key={user.id} className="flex flex-wrap gap-4 justify-center print-card-row">
                                                <IdCardTemplate
                                                    user={user}
                                                    settings={settings}
                                                    type={activeType}
                                                />
                                                {settings.show_back && (
                                                    <IdCardBack settings={settings} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0.5cm;
                        size: A4;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    /* Hide everything except card content */
                    .print\\:hidden {
                        display: none !important;
                    }
                    /* Reset body/html for print */
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                    }
                    /* Center the cards on the page */
                    .print-cards-container {
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: center !important;
                        min-height: 100vh !important;
                        width: 100% !important;
                        padding: 20px !important;
                        box-sizing: border-box !important;
                    }
                    .print-card-row {
                        display: flex !important;
                        justify-content: center !important;
                        align-items: center !important;
                        gap: 20px !important;
                        margin-bottom: 20px !important;
                        page-break-inside: avoid !important;
                    }
                    .break-inside-avoid {
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
