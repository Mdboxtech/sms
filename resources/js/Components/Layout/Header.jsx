import { useState, useEffect } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import NotificationIndicator from '@/Components/NotificationIndicator';
import { useTheme } from '@/Components/ThemeProvider';
import {
    UserCircleIcon,
    MagnifyingGlassIcon,
    SunIcon,
    MoonIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    UserIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    HomeIcon,
    CalendarIcon,
    ClockIcon,
    AcademicCapIcon,
    SparklesIcon,
    GlobeAltIcon,
    Bars3Icon
} from '@heroicons/react/24/outline';

export default function Header({ onMenuClick }) {
    const { auth, appSettings, themeSettings } = usePage().props;
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    // Get dynamic theme colors
    const primaryStart = themeSettings?.primary_start || '#6366f1';
    const primaryEnd = themeSettings?.primary_end || '#8b5cf6';
    const primaryGradient = `linear-gradient(135deg, ${primaryStart}, ${primaryEnd})`;
    const headerStyle = themeSettings?.header_style || 'glass';

    // Get header background based on style
    const getHeaderBackground = () => {
        if (isDarkMode) {
            return {
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                backdropFilter: 'blur(16px)'
            };
        }
        switch (headerStyle) {
            case 'gradient':
                return { background: primaryGradient };
            case 'solid':
                return { backgroundColor: primaryStart };
            case 'glass':
            default:
                return {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(16px)'
                };
        }
    };

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    // Get current page title and breadcrumbs
    const getCurrentPageInfo = () => {
        const currentRoute = route().current();
        const routeParts = currentRoute ? currentRoute.split('.') : [];

        let title = 'Dashboard';
        let breadcrumbs = [{ name: 'Home', href: route('admin.dashboard'), icon: HomeIcon }];

        if (currentRoute) {
            if (currentRoute.includes('admin.students')) {
                title = 'Students Management';
                breadcrumbs.push({ name: 'Students', href: route('admin.students.index'), icon: AcademicCapIcon });
            } else if (currentRoute.includes('admin.teachers')) {
                title = 'Teachers Management';
                breadcrumbs.push({ name: 'Teachers', href: route('admin.teachers.index'), icon: UserIcon });
            } else if (currentRoute.includes('admin.attendance')) {
                title = 'Attendance Management';
                breadcrumbs.push({ name: 'Attendance', href: route('admin.attendance.index'), icon: CalendarIcon });
            } else if (currentRoute.includes('admin.results')) {
                title = 'Results Management';
                breadcrumbs.push({ name: 'Results', href: route('admin.results.index'), icon: SparklesIcon });
            } else if (currentRoute.includes('admin.settings')) {
                title = 'System Settings';
                breadcrumbs.push({ name: 'Settings', href: route('admin.settings.index'), icon: Cog6ToothIcon });
            } else if (currentRoute.includes('admin.classrooms')) {
                title = 'Classrooms';
                breadcrumbs.push({ name: 'Classrooms', href: route('admin.classrooms.index'), icon: AcademicCapIcon });
            } else if (currentRoute.includes('admin.calendar')) {
                title = 'Academic Calendar';
                breadcrumbs.push({ name: 'Calendar', href: route('admin.calendar'), icon: CalendarIcon });
            }
        }

        return { title, breadcrumbs };
    };

    const { title, breadcrumbs } = getCurrentPageInfo();

    // Get current time and date
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <header
            className="border-b border-gray-200/50 shadow-sm sticky top-0 z-40"
            style={getHeaderBackground()}
        >
            {/* Main Header Content */}
            <div className="px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left Section - Hamburger and Title */}
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                        {/* Mobile Hamburger Menu */}
                        <button
                            onClick={onMenuClick}
                            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
                            aria-label="Open menu"
                        >
                            <Bars3Icon className="w-6 h-6 text-gray-600" />
                        </button>

                        {/* Page Title - Hidden on mobile */}
                        <div className="hidden md:flex flex-col">
                            <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight truncate">
                                {title}
                            </h1>
                            {/* Breadcrumbs */}
                            <nav className="hidden sm:flex items-center space-x-1 text-sm">
                                {breadcrumbs.map((crumb, index) => (
                                    <div key={crumb.name} className="flex items-center">
                                        {index > 0 && (
                                            <ChevronRightIcon className="w-3 h-3 text-gray-400 mx-1" />
                                        )}
                                        <Link
                                            href={crumb.href}
                                            className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 transition-colors duration-200"
                                        >
                                            <crumb.icon className="w-3 h-3" />
                                            <span>{crumb.name}</span>
                                        </Link>
                                    </div>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Center Section - Search */}
                    <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50/50 backdrop-blur-sm transition-all duration-200"
                                placeholder="Search students, teachers, classes..."
                            />
                            {searchQuery && (
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="p-1 hover:bg-gray-200 rounded-full transition-colors duration-200"
                                    >
                                        <span className="text-gray-400 text-xs">×</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex items-center space-x-3 flex-1 justify-end">
                        {/* Time Display */}
                        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-lg border border-gray-200/50">
                            <ClockIcon className="w-4 h-4 text-gray-500" />
                            <div className="text-xs">
                                <div className="font-medium text-gray-700">
                                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-gray-500">
                                    {currentTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                            title="Toggle theme"
                        >
                            {isDarkMode ? (
                                <SunIcon className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform duration-200" />
                            ) : (
                                <MoonIcon className="w-5 h-5 text-gray-600 group-hover:scale-110 transition-transform duration-200" />
                            )}
                        </button>

                        {/* Mobile Search Toggle */}
                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
                        >
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
                        </button>

                        {/* Notifications */}
                        <NotificationIndicator user={auth.user} />

                        {/* User Profile Menu */}
                        <Menu as="div" className="relative">
                            <Menu.Button className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                <div className="relative">
                                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow duration-200">
                                        {auth.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                                <div className="text-left hidden sm:block">
                                    <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                                        {auth.user.name}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">
                                        {auth.user.role.name}
                                    </p>
                                </div>
                                <ChevronDownIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                            </Menu.Button>

                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className="absolute right-0 mt-2 w-64 rounded-xl shadow-lg py-2 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200/50 backdrop-blur-lg">
                                    {/* User Info Header */}
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                                {auth.user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{auth.user.name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{auth.user.role.name}</p>
                                                <p className="text-xs text-gray-400">{auth.user.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link
                                                    href={route('profile.edit')}
                                                    className={`${active ? 'bg-gray-50 text-indigo-600' : 'text-gray-700'
                                                        } group flex items-center px-4 py-2 text-sm transition-colors duration-200`}
                                                >
                                                    <UserIcon className="mr-3 h-4 w-4" />
                                                    Profile Settings
                                                </Link>
                                            )}
                                        </Menu.Item>

                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link
                                                    href={route('admin.settings.index')}
                                                    className={`${active ? 'bg-gray-50 text-indigo-600' : 'text-gray-700'
                                                        } group flex items-center px-4 py-2 text-sm transition-colors duration-200`}
                                                >
                                                    <Cog6ToothIcon className="mr-3 h-4 w-4" />
                                                    System Settings
                                                </Link>
                                            )}
                                        </Menu.Item>

                                        <div className="border-t border-gray-100 my-1"></div>

                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={handleLogout}
                                                    className={`${active ? 'bg-red-50 text-red-600' : 'text-gray-700'
                                                        } group flex items-center w-full px-4 py-2 text-sm transition-colors duration-200`}
                                                >
                                                    <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                                                    Sign out
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>
                </div>
            </div>

            {/* Mobile Search Bar */}
            {showSearch && (
                <div className="md:hidden px-4 pb-4 border-t border-gray-200/50">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50/50"
                            placeholder="Search students, teachers, classes..."
                            autoFocus
                        />
                    </div>
                </div>
            )}
        </header>
    );
}
