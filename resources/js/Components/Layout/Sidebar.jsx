import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import UserMenu from '@/Components/Layout/UserMenu';
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
    UserCircle,
    LayoutDashboard,
    FileText,
    School,
    Clock
} from 'lucide-react';

export default function Sidebar() {
    const { auth } = usePage().props;
    const [isOpen, setIsOpen] = useState(true);

    const navigationItems = {
        admin: [
            { name: 'Dashboard', href: route('admin.dashboard'), icon: LayoutDashboard },
            { 
                name: 'Academic', 
                icon: GraduationCap,
                children: [
                    { name: 'Classes', href: route('admin.classrooms.index'), icon: School },
                    { name: 'Subjects', href: route('admin.subjects.index'), icon: BookOpen },
          { name: 'Academic Sessions', href: route('admin.sessions.index'), icon: Clock },
                    { name: 'Calendar', href: route('admin.calendar'), icon: Calendar },
                ]
            },
            {
                name: 'Users',
                icon: Users,
                children: [
                    { name: 'Students', href: route('admin.students.index'), icon: Users },
                    { name: 'Teachers', href: route('admin.teachers.index'), icon: UserCheck },
                ]
            },
            {
                name: 'Results',
                icon: BarChart3,
                children: [
                    { name: 'All Results', href: route('admin.results.index'), icon: List },
                    { name: 'Compile Results', href: route('admin.results.compile.index'), icon: ClipboardCheck },
                    // { name: 'Analysis', href: route('admin.results.analysis'), icon: BarChart3 },
                    { name: 'Report Cards', href: route('report-cards.index'), icon: FileText },
                ]
            },
            { name: 'Settings', href: '/settings', icon: Settings },
        ],
        teacher: [
            { name: 'Dashboard', href: route('teacher.dashboard'), icon: LayoutDashboard },
            { 
                name: 'Classes & Results',
                icon: GraduationCap,
                children: [
                    { name: 'My Classes', href: route('teacher.subjects'), icon: List },
                    { name: 'Enter Results', href: route('teacher.results.create'), icon: ClipboardCheck },
                    { name: 'View Results', href: route('teacher.results.index'), icon: BarChart3 },
                    { name: 'Import Results', href: route('teacher.results.template'), icon: FileText },
                ]
            },
            { name: 'Calendar', href: '/calendar', icon: Calendar },
        ],
        student: [
            { name: 'Dashboard', href: route('student.dashboard'), icon: LayoutDashboard },
            { 
                name: 'Academic',
                icon: GraduationCap,
                children: [
                    { name: 'My Results', href: route('student.results'), icon: BarChart3 },
                    { name: 'Report Card', href: route('student.report-card'), icon: FileText },
                    { name: 'Calendar', href: '/calendar', icon: Calendar },
                ]
            },
        ],
    };

    const navigation = navigationItems[auth.user.role.name] || [];

    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (name) => {
        setOpenMenus(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    const NavItem = ({ item }) => {
        if (item.children) {
            return (
                <div className="space-y-1">
                    <button
                        onClick={() => toggleMenu(item.name)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-700 transition-colors`}
                    >
                        <div className="flex items-center space-x-3">
                            <item.icon className={`w-6 h-6 ${!isOpen && 'mx-auto'}`} />
                            {isOpen && <span>{item.name}</span>}
                        </div>
                        {isOpen && (
                            <ChevronDown
                                className={`w-5 h-5 transform transition-transform ${
                                    openMenus[item.name] ? 'rotate-180' : ''
                                }`}
                            />
                        )}
                    </button>
                    {isOpen && openMenus[item.name] && (
                        <div className="pl-4 space-y-1">
                            {item.children.map((child) => (
                                <Link
                                    key={child.name}
                                    href={child.href}
                                    className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors ${
                                        route().current(child.href) ? 'bg-gray-700' : ''
                                    }`}
                                >
                                    <child.icon className="w-5 h-5" />
                                    <span>{child.name}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link
                href={item.href}
                className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors ${
                    route().current(item.href) ? 'bg-gray-700' : ''
                }`}
            >
                <item.icon className={`w-6 h-6 ${!isOpen && 'mx-auto'}`} />
                {isOpen && <span>{item.name}</span>}
            </Link>
        );
    };

    return (
        <div className={`flex flex-col h-screen ${isOpen ? 'w-64' : 'w-20'} bg-gray-50   transition-all duration-300`}>
            <div className="flex items-center justify-between p-4">
                <div className={`flex items-center space-x-2 ${!isOpen && 'hidden'}`}>
                    <ApplicationLogo className="w-8 h-8" />
                    <span className="font-bold text-xl">SMS</span>
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded-lg hover:bg-gray-700">
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 flex flex-col">
                <nav className="flex-1 space-y-1 p-4">
                    {navigation.map((item) => (
                        <NavItem key={item.name} item={item} />
                    ))}
                </nav>

                {/* <div className="p-4 border-t border-gray-700">
                    {isOpen ? (
                        <UserMenu user={auth.user} />
                    ) : (
                        <Link
                            href={route('profile.edit')}
                            className="flex items-center justify-center p-2 rounded-lg hover:bg-indigo-700"
                        >
                            <UserCircle className="w-6 h-6" />
                        </Link>
                    )}
                </div> */}
            </div>
        </div>
    );
}