import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Select from '@/Components/UI/Select';
import Button from '@/Components/UI/Button';
import {
    CogIcon,
    AcademicCapIcon,
    ServerIcon,
    PhotoIcon,
    ArrowPathIcon,
    TrashIcon,
    CloudArrowUpIcon,
    DocumentArrowDownIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    PaintBrushIcon,
    SwatchIcon
} from '@heroicons/react/24/outline';

export default function Settings({
    auth,
    systemInfo,
    appSettings,
    formThemeSettings,
    currentSession,
    currentTerm,
    backupInfo,
    academicSessions,
    terms,
    flash
}) {
    const [activeTab, setActiveTab] = useState('general');
    const [processing, setProcessing] = useState(false);

    // General Settings Form
    const { data: generalData, setData: setGeneralData, post: postGeneral, processing: processingGeneral, errors: generalErrors } = useForm({
        school_name: appSettings.school_name,
        school_address: appSettings.school_address,
        school_phone: appSettings.school_phone,
        school_email: appSettings.school_email,
        school_tagline: appSettings.school_tagline,
        school_primary_color: appSettings.school_primary_color,
        school_secondary_color: appSettings.school_secondary_color,
    });

    // Academic Settings Form
    const { data: academicData, setData: setAcademicData, post: postAcademic, processing: processingAcademic, errors: academicErrors } = useForm({
        max_score: appSettings.max_score,
        pass_mark: appSettings.pass_mark,
        grading_system: appSettings.grading_system,
        default_password: appSettings.default_password,
    });

    // System Settings Form
    const { data: systemData, setData: setSystemData, post: postSystem, processing: processingSystem, errors: systemErrors } = useForm({
        mail_driver: systemInfo.mail_driver,
        queue_driver: systemInfo.queue_driver,
        auto_backup: backupInfo.auto_backup,
    });

    // Theme Settings Form
    const { data: themeData, setData: setThemeData, post: postTheme, processing: processingTheme, errors: themeErrors } = useForm({
        theme_primary_start: formThemeSettings?.theme_primary_start || '#6366f1',
        theme_primary_end: formThemeSettings?.theme_primary_end || '#8b5cf6',
        theme_secondary_start: formThemeSettings?.theme_secondary_start || '#ec4899',
        theme_secondary_end: formThemeSettings?.theme_secondary_end || '#f59e0b',
        theme_accent_color: formThemeSettings?.theme_accent_color || '#10b981',
        theme_background_start: formThemeSettings?.theme_background_start || '#f8fafc',
        theme_background_end: formThemeSettings?.theme_background_end || '#e2e8f0',
        theme_sidebar_style: formThemeSettings?.theme_sidebar_style || 'gradient',
        theme_header_style: formThemeSettings?.theme_header_style || 'glass',
        theme_button_style: formThemeSettings?.theme_button_style || 'gradient',
    });

    // Theme Presets - Professional color schemes
    const themePresets = [
        {
            name: 'Ocean Blue',
            colors: {
                theme_primary_start: '#0ea5e9',
                theme_primary_end: '#2563eb',
                theme_secondary_start: '#06b6d4',
                theme_secondary_end: '#0891b2',
                theme_accent_color: '#14b8a6',
                theme_background_start: '#f0f9ff',
                theme_background_end: '#e0f2fe',
            }
        },
        {
            name: 'Sunset',
            colors: {
                theme_primary_start: '#f97316',
                theme_primary_end: '#ea580c',
                theme_secondary_start: '#ec4899',
                theme_secondary_end: '#db2777',
                theme_accent_color: '#eab308',
                theme_background_start: '#fff7ed',
                theme_background_end: '#fef3c7',
            }
        },
        {
            name: 'Forest',
            colors: {
                theme_primary_start: '#22c55e',
                theme_primary_end: '#16a34a',
                theme_secondary_start: '#84cc16',
                theme_secondary_end: '#65a30d',
                theme_accent_color: '#14b8a6',
                theme_background_start: '#f0fdf4',
                theme_background_end: '#dcfce7',
            }
        },
        {
            name: 'Royal Purple',
            colors: {
                theme_primary_start: '#8b5cf6',
                theme_primary_end: '#7c3aed',
                theme_secondary_start: '#a855f7',
                theme_secondary_end: '#9333ea',
                theme_accent_color: '#c084fc',
                theme_background_start: '#faf5ff',
                theme_background_end: '#f3e8ff',
            }
        },
        {
            name: 'Rose',
            colors: {
                theme_primary_start: '#f43f5e',
                theme_primary_end: '#e11d48',
                theme_secondary_start: '#ec4899',
                theme_secondary_end: '#db2777',
                theme_accent_color: '#fb7185',
                theme_background_start: '#fff1f2',
                theme_background_end: '#ffe4e6',
            }
        },
        {
            name: 'Emerald',
            colors: {
                theme_primary_start: '#10b981',
                theme_primary_end: '#059669',
                theme_secondary_start: '#14b8a6',
                theme_secondary_end: '#0d9488',
                theme_accent_color: '#34d399',
                theme_background_start: '#ecfdf5',
                theme_background_end: '#d1fae5',
            }
        },
        {
            name: 'Midnight',
            colors: {
                theme_primary_start: '#6366f1',
                theme_primary_end: '#4f46e5',
                theme_secondary_start: '#8b5cf6',
                theme_secondary_end: '#7c3aed',
                theme_accent_color: '#a78bfa',
                theme_background_start: '#f8fafc',
                theme_background_end: '#e2e8f0',
            }
        },
        {
            name: 'Fire',
            colors: {
                theme_primary_start: '#ef4444',
                theme_primary_end: '#dc2626',
                theme_secondary_start: '#f97316',
                theme_secondary_end: '#ea580c',
                theme_accent_color: '#fbbf24',
                theme_background_start: '#fef2f2',
                theme_background_end: '#fee2e2',
            }
        },
    ];

    // Apply a preset theme
    const applyPreset = (preset) => {
        Object.entries(preset.colors).forEach(([key, value]) => {
            setThemeData(key, value);
        });
    };

    // Logo Upload Form
    const { data: logoData, setData: setLogoData, post: postLogo, processing: processingLogo, errors: logoErrors } = useForm({
        logo: null,
    });

    // Active Session/Term Forms
    const { data: sessionData, setData: setSessionData, post: postSession, processing: processingSession } = useForm({
        session_id: currentSession?.id || '',
    });

    const { data: termData, setData: setTermData, post: postTerm, processing: processingTerm } = useForm({
        term_id: currentTerm?.id || '',
    });

    const handleGeneralSubmit = (e) => {
        e.preventDefault();
        postGeneral(route('admin.settings.update.general'));
    };

    const handleAcademicSubmit = (e) => {
        e.preventDefault();
        postAcademic(route('admin.settings.update.academic'));
    };

    const handleSystemSubmit = (e) => {
        e.preventDefault();
        postSystem(route('admin.settings.update.system'));
    };

    const handleThemeSubmit = (e) => {
        e.preventDefault();
        postTheme(route('admin.settings.update.theme'));
    };

    const handleLogoSubmit = (e) => {
        e.preventDefault();
        postLogo(route('admin.settings.upload.logo'), {
            forceFormData: true,
        });
    };

    const handleSessionSubmit = (e) => {
        e.preventDefault();
        postSession(route('admin.settings.active.session'));
    };

    const handleTermSubmit = (e) => {
        e.preventDefault();
        postTerm(route('admin.settings.active.term'));
    };

    const handleAction = (action) => {
        setProcessing(true);
        router.post(route(`admin.settings.${action}`), {}, {
            onFinish: () => setProcessing(false)
        });
    };

    const tabs = [
        { id: 'general', name: 'General', icon: CogIcon },
        { id: 'academic', name: 'Academic', icon: AcademicCapIcon },
        { id: 'theme', name: 'Theme & Colors', icon: PaintBrushIcon },
        { id: 'system', name: 'System', icon: ServerIcon },
        { id: 'maintenance', name: 'Maintenance', icon: ArrowPathIcon },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Settings - SMS" />

            <div className="space-y-6">
                <PageHeader
                    title="System Settings"
                    subtitle="Configure your school management system"
                />

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center">
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                        {flash.error}
                    </div>
                )}

                {/* Tabs */}
                <Card>
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span>{tab.name}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* General Settings */}
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900">School Information</h3>

                                <form onSubmit={handleGeneralSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <InputLabel htmlFor="school_name" value="School Name" />
                                            <TextInput
                                                id="school_name"
                                                type="text"
                                                name="school_name"
                                                value={generalData.school_name}
                                                onChange={(e) => setGeneralData('school_name', e.target.value)}
                                                className="mt-1 block w-full"
                                                required
                                            />
                                            <InputError message={generalErrors.school_name} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="school_email" value="School Email" />
                                            <TextInput
                                                id="school_email"
                                                type="email"
                                                name="school_email"
                                                value={generalData.school_email}
                                                onChange={(e) => setGeneralData('school_email', e.target.value)}
                                                className="mt-1 block w-full"
                                            />
                                            <InputError message={generalErrors.school_email} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="school_phone" value="School Phone" />
                                            <TextInput
                                                id="school_phone"
                                                type="text"
                                                name="school_phone"
                                                value={generalData.school_phone}
                                                onChange={(e) => setGeneralData('school_phone', e.target.value)}
                                                className="mt-1 block w-full"
                                            />
                                            <InputError message={generalErrors.school_phone} className="mt-2" />
                                        </div>
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="school_address" value="School Address" />
                                        <textarea
                                            id="school_address"
                                            name="school_address"
                                            value={generalData.school_address}
                                            onChange={(e) => setGeneralData('school_address', e.target.value)}
                                            rows={3}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        <InputError message={generalErrors.school_address} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="school_tagline" value="School Tagline" />
                                        <TextInput
                                            id="school_tagline"
                                            type="text"
                                            name="school_tagline"
                                            value={generalData.school_tagline}
                                            onChange={(e) => setGeneralData('school_tagline', e.target.value)}
                                            className="mt-1 block w-full"
                                            placeholder="e.g. Nurturing Minds, Building Futures"
                                        />
                                        <InputError message={generalErrors.school_tagline} className="mt-2" />
                                    </div>

                                    {/* <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <InputLabel htmlFor="school_primary_color" value="Primary Color" />
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    id="school_primary_color"
                                                    type="color"
                                                    name="school_primary_color"
                                                    value={generalData.school_primary_color}
                                                    onChange={(e) => setGeneralData('school_primary_color', e.target.value)}
                                                    className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
                                                />
                                                <TextInput
                                                    type="text"
                                                    value={generalData.school_primary_color}
                                                    onChange={(e) => setGeneralData('school_primary_color', e.target.value)}
                                                    className="flex-1"
                                                    placeholder="#2563eb"
                                                />
                                            </div>
                                            <InputError message={generalErrors.school_primary_color} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="school_secondary_color" value="Secondary Color" />
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    id="school_secondary_color"
                                                    type="color"
                                                    name="school_secondary_color"
                                                    value={generalData.school_secondary_color}
                                                    onChange={(e) => setGeneralData('school_secondary_color', e.target.value)}
                                                    className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
                                                />
                                                <TextInput
                                                    type="text"
                                                    value={generalData.school_secondary_color}
                                                    onChange={(e) => setGeneralData('school_secondary_color', e.target.value)}
                                                    className="flex-1"
                                                    placeholder="#f59e0b"
                                                />
                                            </div>
                                            <InputError message={generalErrors.school_secondary_color} className="mt-2" />
                                        </div>
                                    </div> */}

                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={processingGeneral}
                                            variant="primary"
                                        >
                                            {processingGeneral ? 'Saving...' : 'Save General Settings'}
                                        </Button>
                                    </div>
                                </form>

                                {/* Logo Upload Section */}
                                <div className="border-t pt-6">
                                    <h4 className="text-md font-medium text-gray-900 mb-4">School Logo</h4>
                                    <form onSubmit={handleLogoSubmit} className="space-y-4">
                                        <div>
                                            <InputLabel htmlFor="logo" value="Upload Logo" />
                                            <input
                                                id="logo"
                                                type="file"
                                                name="logo"
                                                accept="image/*"
                                                onChange={(e) => setLogoData('logo', e.target.files[0])}
                                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                            />
                                            <InputError message={logoErrors.logo} className="mt-2" />
                                            <p className="mt-1 text-sm text-gray-500">PNG, JPG, GIF up to 2MB</p>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={processingLogo || !logoData.logo}
                                                variant="primary"
                                                className="inline-flex items-center"
                                            >
                                                <PhotoIcon className="h-4 w-4 mr-2" />
                                                {processingLogo ? 'Uploading...' : 'Upload Logo'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Academic Settings */}
                        {activeTab === 'academic' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900">Academic Configuration</h3>

                                <form onSubmit={handleAcademicSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <InputLabel htmlFor="max_score" value="Maximum Score" />
                                            <TextInput
                                                id="max_score"
                                                type="number"
                                                name="max_score"
                                                value={academicData.max_score}
                                                onChange={(e) => setAcademicData('max_score', e.target.value)}
                                                className="mt-1 block w-full"
                                                min="1"
                                                max="1000"
                                                required
                                            />
                                            <InputError message={academicErrors.max_score} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="pass_mark" value="Pass Mark" />
                                            <TextInput
                                                id="pass_mark"
                                                type="number"
                                                name="pass_mark"
                                                value={academicData.pass_mark}
                                                onChange={(e) => setAcademicData('pass_mark', e.target.value)}
                                                className="mt-1 block w-full"
                                                min="1"
                                                max="100"
                                                required
                                            />
                                            <InputError message={academicErrors.pass_mark} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="grading_system" value="Grading System" />
                                            <Select
                                                id="grading_system"
                                                name="grading_system"
                                                value={academicData.grading_system}
                                                onChange={(e) => setAcademicData('grading_system', e.target.value)}
                                                className="mt-1 block w-full"
                                                required
                                            >
                                                <option value="A-F">A-F Grade System</option>
                                                <option value="1-5">1-5 Grade System</option>
                                                <option value="percentage">Percentage System</option>
                                            </Select>
                                            <InputError message={academicErrors.grading_system} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="default_password" value="Default Password for New Users" />
                                            <TextInput
                                                id="default_password"
                                                type="text"
                                                name="default_password"
                                                value={academicData.default_password}
                                                onChange={(e) => setAcademicData('default_password', e.target.value)}
                                                className="mt-1 block w-full"
                                                required
                                            />
                                            <InputError message={academicErrors.default_password} className="mt-2" />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={processingAcademic}
                                            variant="primary"
                                        >
                                            {processingAcademic ? 'Saving...' : 'Save Academic Settings'}
                                        </Button>
                                    </div>
                                </form>

                                {/* Active Session and Term */}
                                <div className="border-t pt-6 space-y-6">
                                    <h4 className="text-md font-medium text-gray-900">Current Academic Period</h4>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <form onSubmit={handleSessionSubmit} className="space-y-4">
                                            <div>
                                                <InputLabel htmlFor="session_id" value="Active Academic Session" />
                                                <Select
                                                    id="session_id"
                                                    name="session_id"
                                                    value={sessionData.session_id}
                                                    onChange={(e) => setSessionData('session_id', e.target.value)}
                                                    className="mt-1 block w-full"
                                                    required
                                                >
                                                    <option value="">Select Session</option>
                                                    {academicSessions.map((session) => (
                                                        <option key={session.id} value={session.id}>
                                                            {session.name}
                                                        </option>
                                                    ))}
                                                </Select>
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={processingSession}
                                                variant="success"
                                            >
                                                {processingSession ? 'Setting...' : 'Set Active Session'}
                                            </Button>
                                        </form>

                                        <form onSubmit={handleTermSubmit} className="space-y-4">
                                            <div>
                                                <InputLabel htmlFor="term_id" value="Active Term" />
                                                <Select
                                                    id="term_id"
                                                    name="term_id"
                                                    value={termData.term_id}
                                                    onChange={(e) => setTermData('term_id', e.target.value)}
                                                    className="mt-1 block w-full"
                                                    required
                                                >
                                                    <option value="">Select Term</option>
                                                    {terms.map((term) => (
                                                        <option key={term.id} value={term.id}>
                                                            {term.name} ({term.academic_session.name})
                                                        </option>
                                                    ))}
                                                </Select>
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={processingTerm}
                                                variant="success"
                                            >
                                                {processingTerm ? 'Setting...' : 'Set Active Term'}
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Theme Settings */}
                        {activeTab === 'theme' && (
                            <div className="space-y-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <SwatchIcon className="h-6 w-6 text-indigo-600" />
                                    <h3 className="text-lg font-medium text-gray-900">Theme & Color Customization</h3>
                                </div>

                                <form onSubmit={handleThemeSubmit} className="space-y-8">
                                    {/* Theme Presets */}
                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                                        <h4 className="text-md font-semibold text-gray-900 mb-2">Quick Theme Presets</h4>
                                        <p className="text-sm text-gray-600 mb-4">Click on a preset to apply a professional color scheme instantly</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                                            {themePresets.map((preset, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => applyPreset(preset)}
                                                    className="group flex flex-col items-center p-3 rounded-xl border-2 border-transparent hover:border-indigo-300 bg-white shadow-sm hover:shadow-md transition-all duration-200"
                                                >
                                                    <div
                                                        className="w-10 h-10 rounded-full mb-2 ring-2 ring-white shadow-md group-hover:scale-110 transition-transform"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${preset.colors.theme_primary_start}, ${preset.colors.theme_primary_end})`
                                                        }}
                                                    />
                                                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">{preset.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Primary Gradient */}
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <h4 className="text-md font-semibold text-gray-900 mb-4">Primary Gradient</h4>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <InputLabel htmlFor="theme_primary_start" value="Primary Start Color" />
                                                <div className="mt-1 flex items-center space-x-3">
                                                    <input
                                                        type="color"
                                                        id="theme_primary_start"
                                                        value={themeData.theme_primary_start}
                                                        onChange={(e) => setThemeData('theme_primary_start', e.target.value)}
                                                        className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                                                    />
                                                    <TextInput
                                                        type="text"
                                                        value={themeData.theme_primary_start}
                                                        onChange={(e) => setThemeData('theme_primary_start', e.target.value)}
                                                        className="flex-1"
                                                        placeholder="#6366f1"
                                                    />
                                                </div>
                                                <InputError message={themeErrors.theme_primary_start} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="theme_primary_end" value="Primary End Color" />
                                                <div className="mt-1 flex items-center space-x-3">
                                                    <input
                                                        type="color"
                                                        id="theme_primary_end"
                                                        value={themeData.theme_primary_end}
                                                        onChange={(e) => setThemeData('theme_primary_end', e.target.value)}
                                                        className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                                                    />
                                                    <TextInput
                                                        type="text"
                                                        value={themeData.theme_primary_end}
                                                        onChange={(e) => setThemeData('theme_primary_end', e.target.value)}
                                                        className="flex-1"
                                                        placeholder="#8b5cf6"
                                                    />
                                                </div>
                                                <InputError message={themeErrors.theme_primary_end} className="mt-2" />
                                            </div>
                                        </div>

                                        {/* Primary Gradient Preview */}
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-600 mb-2">Preview:</p>
                                            <div
                                                className="h-16 rounded-lg border"
                                                style={{
                                                    background: `linear-gradient(135deg, ${themeData.theme_primary_start}, ${themeData.theme_primary_end})`
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Secondary Gradient */}
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <h4 className="text-md font-semibold text-gray-900 mb-4">Secondary Gradient</h4>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <InputLabel htmlFor="theme_secondary_start" value="Secondary Start Color" />
                                                <div className="mt-1 flex items-center space-x-3">
                                                    <input
                                                        type="color"
                                                        id="theme_secondary_start"
                                                        value={themeData.theme_secondary_start}
                                                        onChange={(e) => setThemeData('theme_secondary_start', e.target.value)}
                                                        className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                                                    />
                                                    <TextInput
                                                        type="text"
                                                        value={themeData.theme_secondary_start}
                                                        onChange={(e) => setThemeData('theme_secondary_start', e.target.value)}
                                                        className="flex-1"
                                                        placeholder="#ec4899"
                                                    />
                                                </div>
                                                <InputError message={themeErrors.theme_secondary_start} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="theme_secondary_end" value="Secondary End Color" />
                                                <div className="mt-1 flex items-center space-x-3">
                                                    <input
                                                        type="color"
                                                        id="theme_secondary_end"
                                                        value={themeData.theme_secondary_end}
                                                        onChange={(e) => setThemeData('theme_secondary_end', e.target.value)}
                                                        className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                                                    />
                                                    <TextInput
                                                        type="text"
                                                        value={themeData.theme_secondary_end}
                                                        onChange={(e) => setThemeData('theme_secondary_end', e.target.value)}
                                                        className="flex-1"
                                                        placeholder="#f59e0b"
                                                    />
                                                </div>
                                                <InputError message={themeErrors.theme_secondary_end} className="mt-2" />
                                            </div>
                                        </div>

                                        {/* Secondary Gradient Preview */}
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-600 mb-2">Preview:</p>
                                            <div
                                                className="h-16 rounded-lg border"
                                                style={{
                                                    background: `linear-gradient(135deg, ${themeData.theme_secondary_start}, ${themeData.theme_secondary_end})`
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Background & Accent Colors */}
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <h4 className="text-md font-semibold text-gray-900 mb-4">Background & Accent Colors</h4>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                            <div>
                                                <InputLabel htmlFor="theme_background_start" value="Background Start" />
                                                <div className="mt-1 flex items-center space-x-3">
                                                    <input
                                                        type="color"
                                                        id="theme_background_start"
                                                        value={themeData.theme_background_start}
                                                        onChange={(e) => setThemeData('theme_background_start', e.target.value)}
                                                        className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                                                    />
                                                    <TextInput
                                                        type="text"
                                                        value={themeData.theme_background_start}
                                                        onChange={(e) => setThemeData('theme_background_start', e.target.value)}
                                                        className="flex-1"
                                                        placeholder="#f8fafc"
                                                    />
                                                </div>
                                                <InputError message={themeErrors.theme_background_start} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="theme_background_end" value="Background End" />
                                                <div className="mt-1 flex items-center space-x-3">
                                                    <input
                                                        type="color"
                                                        id="theme_background_end"
                                                        value={themeData.theme_background_end}
                                                        onChange={(e) => setThemeData('theme_background_end', e.target.value)}
                                                        className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                                                    />
                                                    <TextInput
                                                        type="text"
                                                        value={themeData.theme_background_end}
                                                        onChange={(e) => setThemeData('theme_background_end', e.target.value)}
                                                        className="flex-1"
                                                        placeholder="#e2e8f0"
                                                    />
                                                </div>
                                                <InputError message={themeErrors.theme_background_end} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="theme_accent_color" value="Accent Color" />
                                                <div className="mt-1 flex items-center space-x-3">
                                                    <input
                                                        type="color"
                                                        id="theme_accent_color"
                                                        value={themeData.theme_accent_color}
                                                        onChange={(e) => setThemeData('theme_accent_color', e.target.value)}
                                                        className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                                                    />
                                                    <TextInput
                                                        type="text"
                                                        value={themeData.theme_accent_color}
                                                        onChange={(e) => setThemeData('theme_accent_color', e.target.value)}
                                                        className="flex-1"
                                                        placeholder="#10b981"
                                                    />
                                                </div>
                                                <InputError message={themeErrors.theme_accent_color} className="mt-2" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Style Options */}
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <h4 className="text-md font-semibold text-gray-900 mb-4">Style Options</h4>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                            <div>
                                                <InputLabel htmlFor="theme_sidebar_style" value="Sidebar Style" />
                                                <Select
                                                    id="theme_sidebar_style"
                                                    name="theme_sidebar_style"
                                                    value={themeData.theme_sidebar_style}
                                                    onChange={(e) => setThemeData('theme_sidebar_style', e.target.value)}
                                                    className="mt-1 block w-full"
                                                >
                                                    <option value="gradient">Gradient</option>
                                                    <option value="solid">Solid</option>
                                                    <option value="glass">Glass</option>
                                                </Select>
                                                <InputError message={themeErrors.theme_sidebar_style} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="theme_header_style" value="Header Style" />
                                                <Select
                                                    id="theme_header_style"
                                                    name="theme_header_style"
                                                    value={themeData.theme_header_style}
                                                    onChange={(e) => setThemeData('theme_header_style', e.target.value)}
                                                    className="mt-1 block w-full"
                                                >
                                                    <option value="gradient">Gradient</option>
                                                    <option value="solid">Solid</option>
                                                    <option value="glass">Glass</option>
                                                </Select>
                                                <InputError message={themeErrors.theme_header_style} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="theme_button_style" value="Button Style" />
                                                <Select
                                                    id="theme_button_style"
                                                    name="theme_button_style"
                                                    value={themeData.theme_button_style}
                                                    onChange={(e) => setThemeData('theme_button_style', e.target.value)}
                                                    className="mt-1 block w-full"
                                                >
                                                    <option value="gradient">Gradient</option>
                                                    <option value="solid">Solid</option>
                                                    <option value="outline">Outline</option>
                                                </Select>
                                                <InputError message={themeErrors.theme_button_style} className="mt-2" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview Section */}
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <h4 className="text-md font-semibold text-gray-900 mb-4">Live Preview</h4>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            {/* Button Previews */}
                                            <div>
                                                <p className="text-sm text-gray-600 mb-3">Button Styles:</p>
                                                <div className="flex space-x-3">
                                                    <button
                                                        type="button"
                                                        className="px-4 py-2 rounded-lg text-white font-medium"
                                                        style={{
                                                            background: themeData.theme_button_style === 'gradient'
                                                                ? `linear-gradient(135deg, ${themeData.theme_primary_start}, ${themeData.theme_primary_end})`
                                                                : themeData.theme_button_style === 'solid'
                                                                    ? themeData.theme_primary_start
                                                                    : 'transparent',
                                                            border: themeData.theme_button_style === 'outline' ? `2px solid ${themeData.theme_primary_start}` : 'none',
                                                            color: themeData.theme_button_style === 'outline' ? themeData.theme_primary_start : 'white'
                                                        }}
                                                    >
                                                        Primary
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="px-4 py-2 rounded-lg text-white font-medium"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${themeData.theme_secondary_start}, ${themeData.theme_secondary_end})`
                                                        }}
                                                    >
                                                        Secondary
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Background Preview */}
                                            <div>
                                                <p className="text-sm text-gray-600 mb-3">Background Gradient:</p>
                                                <div
                                                    className="h-20 rounded-lg border"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${themeData.theme_background_start}, ${themeData.theme_background_end})`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={processingTheme}
                                            variant="primary"
                                        >
                                            {processingTheme ? 'Updating...' : 'Update Theme Settings'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* System Settings */}
                        {activeTab === 'system' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900">System Configuration</h3>

                                <form onSubmit={handleSystemSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <InputLabel htmlFor="mail_driver" value="Mail Driver" />
                                            <Select
                                                id="mail_driver"
                                                name="mail_driver"
                                                value={systemData.mail_driver}
                                                onChange={(e) => setSystemData('mail_driver', e.target.value)}
                                                className="mt-1 block w-full"
                                                required
                                            >
                                                <option value="smtp">SMTP</option>
                                                <option value="sendmail">Sendmail</option>
                                                <option value="mailgun">Mailgun</option>
                                                <option value="ses">Amazon SES</option>
                                                <option value="postmark">Postmark</option>
                                            </Select>
                                            <InputError message={systemErrors.mail_driver} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="queue_driver" value="Queue Driver" />
                                            <Select
                                                id="queue_driver"
                                                name="queue_driver"
                                                value={systemData.queue_driver}
                                                onChange={(e) => setSystemData('queue_driver', e.target.value)}
                                                className="mt-1 block w-full"
                                                required
                                            >
                                                <option value="sync">Sync (No Queue)</option>
                                                <option value="database">Database</option>
                                                <option value="redis">Redis</option>
                                                <option value="sqs">Amazon SQS</option>
                                            </Select>
                                            <InputError message={systemErrors.queue_driver} className="mt-2" />
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="auto_backup"
                                            name="auto_backup"
                                            type="checkbox"
                                            checked={systemData.auto_backup}
                                            onChange={(e) => setSystemData('auto_backup', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="auto_backup" className="ml-2 block text-sm text-gray-900">
                                            Enable automatic daily backups
                                        </label>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={processingSystem}
                                            variant="primary"
                                        >
                                            {processingSystem ? 'Saving...' : 'Save System Settings'}
                                        </Button>
                                    </div>
                                </form>

                                {/* System Information */}
                                <div className="border-t pt-6">
                                    <h4 className="text-md font-medium text-gray-900 mb-4">System Information</h4>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <dl className="space-y-2">
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">App Version</dt>
                                                    <dd className="text-sm text-gray-900">{systemInfo.app_version}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Laravel Version</dt>
                                                    <dd className="text-sm text-gray-900">{systemInfo.laravel_version}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">PHP Version</dt>
                                                    <dd className="text-sm text-gray-900">{systemInfo.php_version}</dd>
                                                </div>
                                            </dl>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <dl className="space-y-2">
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Database</dt>
                                                    <dd className="text-sm text-gray-900">{systemInfo.database_connection}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Storage</dt>
                                                    <dd className="text-sm text-gray-900">{systemInfo.storage_disk}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Mail Driver</dt>
                                                    <dd className="text-sm text-gray-900">{systemInfo.mail_driver}</dd>
                                                </div>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Maintenance */}
                        {activeTab === 'maintenance' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900">System Maintenance</h3>

                                {/* Backup Section */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <DocumentArrowDownIcon className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                                        <div className="flex-1">
                                            <h4 className="text-md font-medium text-blue-900">Database Backup</h4>
                                            <p className="text-sm text-blue-700 mt-1">
                                                Create a backup of your database. Last backup: {backupInfo.last_backup}
                                            </p>
                                            <Button
                                                onClick={() => handleAction('backup')}
                                                disabled={processing}
                                                variant="info"
                                                className="mt-3 inline-flex items-center"
                                            >
                                                <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                                                {processing ? 'Creating Backup...' : 'Create Backup'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Cache Management */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-3 mt-1" />
                                        <div className="flex-1">
                                            <h4 className="text-md font-medium text-yellow-900">Clear System Cache</h4>
                                            <p className="text-sm text-yellow-700 mt-1">
                                                Clear all cached data including routes, views, and configuration. Use this if you're experiencing issues.
                                            </p>
                                            <Button
                                                onClick={() => handleAction('clear-cache')}
                                                disabled={processing}
                                                variant="warning"
                                                className="mt-3 inline-flex items-center"
                                            >
                                                <TrashIcon className="h-4 w-4 mr-2" />
                                                {processing ? 'Clearing Cache...' : 'Clear All Cache'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* System Optimization */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 mt-1" />
                                        <div className="flex-1">
                                            <h4 className="text-md font-medium text-green-900">Optimize System</h4>
                                            <p className="text-sm text-green-700 mt-1">
                                                Cache routes, views, and configuration for better performance. Recommended for production.
                                            </p>
                                            <Button
                                                onClick={() => handleAction('optimize')}
                                                disabled={processing}
                                                variant="success"
                                                className="mt-3 inline-flex items-center"
                                            >
                                                <ArrowPathIcon className="h-4 w-4 mr-2" />
                                                {processing ? 'Optimizing...' : 'Optimize System'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
