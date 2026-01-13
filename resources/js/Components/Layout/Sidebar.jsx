import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import UserMenu from '@/Components/Layout/UserMenu';
import useNotifications from '@/Hooks/useNotifications';
import useMessages from '@/Hooks/useMessages';
import MessageIndicator from '@/Components/MessageIndicator';
import {
    GraduationCap,
    Users,
    BookOpen,
    BarChart3,
    Settings,
    Calendar,
    ClipboardCheck,
    List,
    UserCheck,
    Menu,
    ChevronDown,
    ChevronRight,
    UserCircle,
    LayoutDashboard,
    FileText,
    School,
    Clock,
    X,
    Home,
    Bell,
    Search,
    LogOut,
    User,
    HelpCircle,
    Mail,
    MessageSquare,
    Monitor,
    CheckSquare,
    PenTool,
    PlayCircle,
    CreditCard,
    DollarSign,
    Receipt,
    History,
    TestTube
} from 'lucide-react';

export default function Sidebar() {
    const { auth, appSettings, url, themeSettings } = usePage().props;
    const { unreadCount } = useNotifications();
    const { unreadMessagesCount } = useMessages();
    const [isOpen, setIsOpen] = useState(true);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [manuallyOpenedMenus, setManuallyOpenedMenus] = useState({});
    const [openMenus, setOpenMenus] = useState(() => {
        // Load saved menu states from localStorage
        try {
            const saved = localStorage.getItem('sidebar-menu-states');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    });

    // Dynamic theme colors
    const primaryStart = themeSettings?.primary_start || '#6366f1';
    const primaryEnd = themeSettings?.primary_end || '#8b5cf6';
    const accentColor = themeSettings?.accent_color || '#10b981';

    // Auto-collapse on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Check on initial load

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-expand menus with active children and auto-close menus without active children
    useEffect(() => {
        const navigation = navigationItems[auth.user.role.name] || [];
        const newOpenMenus = { ...openMenus };
        const newManuallyOpened = { ...manuallyOpenedMenus };
        let hasChanges = false;
        let hasManualChanges = false;

        navigation.forEach(item => {
            if (item.children) {
                const hasActiveChild = item.children.some(child => isRouteActive(child.routeName || child.href));

                // Auto-expand if has active child and not already open
                if (hasActiveChild && !newOpenMenus[item.name]) {
                    newOpenMenus[item.name] = true;
                    hasChanges = true;
                }

                // Auto-close if no active child, currently open, and not manually opened
                if (!hasActiveChild && newOpenMenus[item.name] && !manuallyOpenedMenus[item.name]) {
                    newOpenMenus[item.name] = false;
                    hasChanges = true;
                }

                // Reset manual state if we navigate to an active child (user found what they were looking for)
                if (hasActiveChild && manuallyOpenedMenus[item.name]) {
                    newManuallyOpened[item.name] = false;
                    hasManualChanges = true;
                }
            }
        });

        if (hasChanges) {
            setOpenMenus(newOpenMenus);
            try {
                localStorage.setItem('sidebar-menu-states', JSON.stringify(newOpenMenus));
            } catch (e) {
                // Ignore localStorage errors
            }
        }

        if (hasManualChanges) {
            setManuallyOpenedMenus(newManuallyOpened);
        }
    }, [url, manuallyOpenedMenus]);

    // Helper function to check if a route is active
    const isRouteActive = (routeName) => {
        if (!routeName) return false;

        try {
            // Get current route name
            const currentRoute = route().current();

            if (!currentRoute) {
                // Fallback to URL comparison if route().current() fails
                const currentPath = window.location.pathname;
                const targetPath = route(routeName);
                return currentPath === targetPath;
            }

            // Check exact match first
            if (currentRoute === routeName) return true;

            // For index routes, also check if we're on a child route
            if (routeName.endsWith('.index')) {
                const baseRoute = routeName.replace('.index', '');
                return currentRoute.startsWith(baseRoute + '.');
            }

            // For parent routes, check if current route starts with the base
            if (!routeName.includes('.index') && !routeName.includes('.show') && !routeName.includes('.edit') && !routeName.includes('.create')) {
                return currentRoute.startsWith(routeName + '.');
            }

            return false;
        } catch (e) {
            // Fallback to URL comparison
            try {
                const currentPath = window.location.pathname;
                const targetPath = route(routeName);
                return currentPath === targetPath;
            } catch (e2) {
                console.warn('Route checking failed for:', routeName, e2);
                return false;
            }
        }
    };

    const navigationItems = {
        admin: [
            { name: 'Dashboard', href: route('admin.dashboard'), routeName: 'admin.dashboard', icon: LayoutDashboard, badge: null },
            {
                name: 'Academic',
                icon: GraduationCap,
                badge: null,
                children: [
                    { name: 'Classes', href: route('admin.classrooms.index'), routeName: 'admin.classrooms.index', icon: School },
                    { name: 'Subjects', href: route('admin.subjects.index'), routeName: 'admin.subjects.index', icon: BookOpen },
                    { name: 'Academic Sessions', href: route('admin.sessions.index'), routeName: 'admin.sessions.index', icon: Clock },
                    { name: 'Calendar', href: route('admin.calendar'), routeName: 'admin.calendar', icon: Calendar },
                ]
            },
            {
                name: 'Users',
                icon: Users,
                badge: null,
                children: [
                    { name: 'Students', href: route('admin.students.index'), routeName: 'admin.students.index', icon: Users },
                    { name: 'Teachers', href: route('admin.teachers.index'), routeName: 'admin.teachers.index', icon: UserCheck },
                ]
            },
            {
                name: 'Attendance',
                href: route('admin.attendance.index'),
                routeName: 'admin.attendance.index',
                icon: Calendar,
                badge: null,
            },
            {
                name: 'CBT System',
                icon: Monitor,
                badge: 'New',
                children: [
                    { name: 'Questions Bank', href: route('admin.cbt.questions.index'), routeName: 'admin.cbt.questions.index', icon: PenTool },
                    { name: 'Exams', href: route('admin.cbt.exams.index'), routeName: 'admin.cbt.exams.index', icon: FileText },
                    { name: 'Analytics', href: route('admin.cbt.analytics'), routeName: 'admin.cbt.analytics', icon: BarChart3 },
                ]
            },
            {
                name: 'Results',
                icon: BarChart3,
                badge: 'New',
                children: [
                    { name: 'All Results', href: route('admin.results.index'), routeName: 'admin.results.index', icon: List },
                    { name: 'Compile Results', href: route('admin.results.compile'), routeName: 'admin.results.compile', icon: ClipboardCheck },
                    { name: 'Report Cards', href: route('admin.report-cards.index'), routeName: 'admin.report-cards.index', icon: FileText },
                ]
            },
            {
                name: 'Payments',
                icon: CreditCard,
                badge: 'New',
                children: [
                    { name: 'Fee Management', href: route('admin.fees.index'), routeName: 'admin.fees.index', icon: DollarSign },
                    { name: 'Payment Records', href: route('admin.payments.index'), routeName: 'admin.payments.index', icon: Receipt },
                    { name: 'Payment Settings', href: route('admin.settings.payment'), routeName: 'admin.settings.payment', icon: Settings },
                    { name: 'Paystack Demo', href: route('admin.demo.paystack'), routeName: 'admin.demo.paystack', icon: TestTube },
                ]
            },
            {
                name: 'Communication',
                icon: MessageSquare,
                badge: (unreadCount + unreadMessagesCount) > 0 ? (unreadCount + unreadMessagesCount) : null,
                children: [
                    { name: 'Notifications', href: route('notifications.index'), routeName: 'notifications.index', icon: Bell, badge: unreadCount > 0 ? unreadCount : null },
                    { name: 'Inbox', href: route('messages.inbox'), routeName: 'messages.inbox', icon: Mail, badge: unreadMessagesCount > 0 ? unreadMessagesCount : null },
                    { name: 'Send Message', href: route('messages.create'), routeName: 'messages.create', icon: MessageSquare },
                ]
            },
            { name: 'Settings', href: route('admin.settings.index'), routeName: 'admin.settings.index', icon: Settings, badge: null },
        ],
        teacher: [
            { name: 'Dashboard', href: route('teacher.dashboard'), routeName: 'teacher.dashboard', icon: LayoutDashboard },
            { name: 'Attendance', href: route('teacher.attendance.index'), routeName: 'teacher.attendance.index', icon: Calendar, badge: null },
            {
                name: 'Classes & Results',
                icon: GraduationCap,
                children: [
                    { name: 'My Classes', href: route('teacher.subjects'), routeName: 'teacher.subjects', icon: List },
                    { name: 'My Students', href: route('teacher.students'), routeName: 'teacher.students', icon: Users },
                    { name: 'Enter Results', href: route('teacher.results.create'), routeName: 'teacher.results.create', icon: ClipboardCheck },
                    { name: 'View Results', href: route('teacher.results.index'), routeName: 'teacher.results.index', icon: BarChart3 },
                    { name: 'Bulk Entry', href: route('teacher.results.bulk-create'), routeName: 'teacher.results.bulk-create', icon: FileText },
                ]
            },
            {
                name: 'CBT System',
                icon: Monitor,
                badge: 'New',
                children: [
                    { name: 'My Questions', href: route('teacher.cbt.questions.index'), routeName: 'teacher.cbt.questions.index', icon: PenTool },
                    { name: 'My Exams', href: route('teacher.cbt.exams.index'), routeName: 'teacher.cbt.exams.index', icon: CheckSquare },
                ]
            },
            {
                name: 'Communication',
                icon: MessageSquare,
                badge: (unreadCount + unreadMessagesCount) > 0 ? (unreadCount + unreadMessagesCount) : null,
                children: [
                    { name: 'Notifications', href: route('notifications.index'), routeName: 'notifications.index', icon: Bell, badge: unreadCount > 0 ? unreadCount : null },
                    { name: 'Inbox', href: route('messages.inbox'), routeName: 'messages.inbox', icon: Mail, badge: unreadMessagesCount > 0 ? unreadMessagesCount : null },
                ]
            },
            { name: 'Calendar', href: route('calendar.index'), routeName: 'calendar.index', icon: Calendar },
        ],
        student: [
            { name: 'Dashboard', href: route('student.dashboard'), routeName: 'student.dashboard', icon: LayoutDashboard },
            {
                name: 'Academic',
                icon: GraduationCap,
                children: [
                    { name: 'My Results', href: route('student.results.index'), routeName: 'student.results.index', icon: BarChart3 },
                    { name: 'Progress', href: route('student.results.progress'), routeName: 'student.results.progress', icon: FileText },
                    { name: 'Calendar', href: route('calendar.index'), routeName: 'calendar.index', icon: Calendar },
                ]
            },
            {
                name: 'CBT Exams',
                icon: Monitor,
                badge: 'New',
                children: [
                    { name: 'Available Exams', href: route('student.cbt.index'), routeName: 'student.cbt.index', icon: PlayCircle },
                    { name: 'My Results', href: route('student.cbt.results.index'), routeName: 'student.cbt.results.index', icon: BarChart3 },
                    { name: 'Report Card', href: route('student.cbt.results.report-card'), routeName: 'student.cbt.results.report-card', icon: FileText },
                    { name: 'Exam Timetable', href: route('student.cbt.timetable'), routeName: 'student.cbt.timetable', icon: Clock },
                ]
            },
            {
                name: 'School Fees',
                icon: CreditCard,
                badge: 'New',
                children: [
                    { name: 'Payment Dashboard', href: route('student.payments.dashboard'), routeName: 'student.payments.dashboard', icon: DollarSign },
                    { name: 'Payment History', href: route('student.payments.history'), routeName: 'student.payments.history', icon: History },
                    { name: 'Receipts', href: route('student.receipts.index'), routeName: 'student.receipts.index', icon: Receipt },
                ]
            },
            {
                name: 'Communication',
                icon: MessageSquare,
                badge: (unreadCount + unreadMessagesCount) > 0 ? (unreadCount + unreadMessagesCount) : null,
                children: [
                    { name: 'Notifications', href: route('notifications.index'), routeName: 'notifications.index', icon: Bell, badge: unreadCount > 0 ? unreadCount : null },
                    { name: 'Inbox', href: route('messages.inbox'), routeName: 'messages.inbox', icon: Mail, badge: unreadMessagesCount > 0 ? unreadMessagesCount : null },
                ]
            },
        ],
    };

    const navigation = navigationItems[auth.user.role.name] || [];

    const toggleMenu = (name) => {
        const isCurrentlyOpen = openMenus[name];
        const newOpenMenus = {
            ...openMenus,
            [name]: !isCurrentlyOpen
        };
        setOpenMenus(newOpenMenus);

        // Track manually opened/closed menus
        const newManuallyOpenedMenus = {
            ...manuallyOpenedMenus,
            [name]: !isCurrentlyOpen
        };
        setManuallyOpenedMenus(newManuallyOpenedMenus);

        // Save to localStorage
        try {
            localStorage.setItem('sidebar-menu-states', JSON.stringify(newOpenMenus));
        } catch (e) {
            // Ignore localStorage errors
        }
    };

    const NavItem = ({ item }) => {
        const isActive = item.href && isRouteActive(item.routeName || item.href);
        const hasActiveChild = item.children?.some(child => isRouteActive(child.routeName || child.href));
        const isMenuOpen = openMenus[item.name];

        // Dynamic styles
        const activeBorderStyle = { borderLeftColor: primaryStart };
        const activeBgStyle = { backgroundColor: `${primaryStart}15` };
        const activeTextStyle = { color: primaryStart };
        const activeDotStyle = { backgroundColor: primaryStart };
        const activeIconBgStyle = { backgroundColor: `${primaryStart}20`, color: primaryStart };

        if (item.children) {
            return (
                <div className="space-y-1">
                    <button
                        onClick={() => toggleMenu(item.name)}
                        onMouseEnter={() => setHoveredItem(item.name)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={`w-full group relative flex items-center justify-between p-3 rounded-xl font-medium transition-all duration-200 ${hasActiveChild
                                ? 'bg-gray-50 text-gray-900 border-l-4'
                                : isMenuOpen
                                    ? 'bg-gray-50 text-gray-900'
                                    : hoveredItem === item.name
                                        ? 'bg-gray-50 text-gray-900'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        style={hasActiveChild ? activeBorderStyle : {}}
                    >
                        <div className="flex items-center space-x-3">
                            <div
                                className={`p-1 rounded-lg transition-all duration-200 ${hasActiveChild ? '' : 'group-hover:bg-gray-100'
                                    }`}
                                style={hasActiveChild ? activeIconBgStyle : {}}
                            >
                                <item.icon className={`w-5 h-5 ${!isOpen && 'mx-auto'} transition-transform duration-200 ${hoveredItem === item.name ? 'scale-110' : ''
                                    }`} />
                            </div>
                            {isOpen && (
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm">{item.name}</span>
                                    {item.badge && (
                                        <span
                                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white animate-pulse"
                                            style={{ background: `linear-gradient(135deg, ${primaryStart}, ${primaryEnd})` }}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        {isOpen && (
                            <ChevronDown
                                className={`w-4 h-4 transform transition-all duration-300 ${isMenuOpen ? 'rotate-180' : ''
                                    }`}
                            />
                        )}

                        {/* Badge for collapsed state */}
                        {!isOpen && item.badge && (
                            <div
                                className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                                style={{ backgroundColor: primaryStart }}
                            />
                        )}

                        {/* Active indicator for parent menu */}
                        {hasActiveChild && (
                            <div
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full"
                                style={activeDotStyle}
                            />
                        )}
                    </button>

                    {/* Submenu */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen && isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                        <div className="pl-3 pt-2 space-y-1">
                            {item.children.map((child) => {
                                const isChildActive = isRouteActive(child.routeName || child.href);
                                return (
                                    <Link
                                        key={child.name}
                                        href={child.href}
                                        onMouseEnter={() => setHoveredItem(child.name)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        className={`group flex items-center space-x-3 p-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative ${isChildActive
                                                ? 'border-l-4 font-semibold'
                                                : hoveredItem === child.name
                                                    ? 'bg-gray-50 text-gray-700'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        style={isChildActive ? { ...activeBgStyle, ...activeBorderStyle, color: primaryStart } : {}}
                                    >
                                        <div
                                            className={`p-1 rounded-md transition-all duration-200 ${isChildActive ? '' : 'group-hover:bg-gray-100'
                                                }`}
                                            style={isChildActive ? activeIconBgStyle : {}}
                                        >
                                            <child.icon className={`w-4 h-4 transition-transform duration-200 ${hoveredItem === child.name ? 'scale-110' : ''
                                                }`} />
                                        </div>
                                        <span>{child.name}</span>

                                        {/* Active indicator for child */}
                                        {isChildActive && (
                                            <div
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full"
                                                style={activeDotStyle}
                                            />
                                        )}

                                        {/* Hover arrow */}
                                        {hoveredItem === child.name && !isChildActive && (
                                            <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <Link
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`group flex items-center space-x-3 p-3 rounded-xl font-medium transition-all duration-200 relative ${isActive
                        ? 'border-l-4 font-semibold'
                        : hoveredItem === item.name
                            ? 'bg-gray-50 text-gray-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                style={isActive ? { ...activeBgStyle, ...activeBorderStyle, color: primaryStart } : {}}
            >
                <div
                    className={`p-1 rounded-lg transition-all duration-200 ${isActive ? '' : 'group-hover:bg-gray-100'
                        }`}
                    style={isActive ? activeIconBgStyle : {}}
                >
                    <item.icon className={`w-5 h-5 ${!isOpen && 'mx-auto'} transition-transform duration-200 ${hoveredItem === item.name ? 'scale-110' : ''
                        }`} />
                </div>
                {isOpen && (
                    <div className="flex items-center space-x-2">
                        <span className="text-sm">{item.name}</span>
                        {item.badge && (
                            <span
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white animate-pulse"
                                style={{ background: `linear-gradient(135deg, ${primaryStart}, ${primaryEnd})` }}
                            >
                                {item.badge}
                            </span>
                        )}
                    </div>
                )}

                {/* Active indicator for single items */}
                {isActive && (
                    <div
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full"
                        style={activeDotStyle}
                    />
                )}

                {/* Hover arrow */}
                {hoveredItem === item.name && !isActive && isOpen && (
                    <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                )}

                {/* Badge for collapsed state */}
                {!isOpen && item.badge && (
                    <div
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                        style={{ backgroundColor: primaryStart }}
                    />
                )}
            </Link>
        );
    };

    return (
        <div
            className={`flex flex-col h-screen ${isOpen ? 'w-72' : 'w-20'} bg-white border-r border-gray-200/50 shadow-xl transition-all duration-300 ease-in-out relative overflow-auto`}
        >
            {/* Background Pattern - uses theme colors */}
            <div className="absolute inset-0 opacity-30">
                <div
                    className="absolute inset-0"
                    style={{
                        background: `linear-gradient(135deg, ${primaryStart}08 0%, transparent 50%, ${primaryEnd}08 100%)`
                    }}
                />
                <div
                    className="absolute top-0 left-0 w-full h-full"
                    style={{
                        background: `radial-gradient(circle at 50% 50%, ${primaryStart}10, transparent 50%)`
                    }}
                />
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-6 border-b border-gray-200/50 bg-white/70 backdrop-blur-sm">
                <div className={`flex items-center space-x-3 transition-all duration-300 ${!isOpen && 'justify-center'}`}>
                    <div className="relative">
                        {isOpen && (<ApplicationLogo className="w-10 h-10 drop-shadow-md" />)}
                        <div
                            className="absolute inset-0 rounded-lg blur-lg opacity-20 -z-10"
                            style={{ background: `linear-gradient(135deg, ${primaryStart}, ${primaryEnd})` }}
                        />
                    </div>
                    {isOpen && (
                        <div className="flex flex-col">
                            <span className="font-bold text-xl text-gray-900 tracking-tight">
                                {appSettings?.school_name?.split(' ').slice(0, 2).join(' ') || 'SMS'}
                            </span>
                            {appSettings?.school_tagline && (
                                <span className="text-xs text-gray-500 font-medium">
                                    {appSettings.school_tagline}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-xl hover:bg-white/80 text-gray-600 transition-all duration-200 hover:shadow-md group border border-gray-200/50"
                >
                    {isOpen ? (
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    ) : (
                        <Menu className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 flex flex-col relative z-10 bg-gradient-to-b from-transparent to-white/30">
                <nav className="flex-1 space-y-2 p-4">
                    {navigation.map((item) => (
                        <NavItem key={item.name} item={item} />
                    ))}
                </nav>

                {/* User Profile Section */}
                <div className="p-4 border-t border-gray-200/50 bg-white/70 backdrop-blur-sm">
                    {/* User Profile */}
                    {isOpen ? (
                        <div
                            className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200"
                            style={{ background: `linear-gradient(135deg, #f9fafb, ${primaryStart}08)` }}
                        >
                            <div className="relative">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                                    style={{ background: `linear-gradient(135deg, ${primaryStart}, ${primaryEnd})` }}
                                >
                                    {auth.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div
                                    className="absolute inset-0 rounded-full blur-md opacity-20 -z-10"
                                    style={{ background: `linear-gradient(135deg, ${primaryStart}, ${primaryEnd})` }}
                                />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate">{auth.user.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{auth.user.role.name}</p>
                            </div>
                            <div className="flex flex-col space-y-1">
                                <Link
                                    href={route('profile.edit')}
                                    className="p-1.5 rounded-lg text-gray-400 transition-all duration-200"
                                    style={{ ':hover': { backgroundColor: `${primaryStart}20`, color: primaryStart } }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${primaryStart}20`; e.currentTarget.style.color = primaryStart; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}
                                >
                                    <User className="w-4 h-4" />
                                </Link>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-all duration-200"
                                >
                                    <LogOut className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-2 items-center">
                            <div className="relative">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                                    style={{ background: `linear-gradient(135deg, ${primaryStart}, ${primaryEnd})` }}
                                >
                                    {auth.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div
                                    className="absolute inset-0 rounded-full blur-md opacity-20 -z-10"
                                    style={{ background: `linear-gradient(135deg, ${primaryStart}, ${primaryEnd})` }}
                                />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div className="flex space-x-1">
                                <Link
                                    href={route('profile.edit')}
                                    className="p-1.5 rounded-lg text-gray-400 transition-all duration-200"
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${primaryStart}20`; e.currentTarget.style.color = primaryStart; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}
                                >
                                    <User className="w-4 h-4" />
                                </Link>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-all duration-200"
                                >
                                    <LogOut className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Footer branding */}
                    {isOpen && (
                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-400 font-medium">
                                Powered by SMS v2.0
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden z-[-1]"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </div>
    );
}