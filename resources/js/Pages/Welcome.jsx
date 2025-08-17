import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { GraduationCap, Users, BookOpen, Calendar, Award, Bell, ChevronRight, Menu, X } from 'lucide-react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Customizable school configuration - modify these for different schools
    const schoolConfig = {
        name: "Excellence Academy",
        logo: "/images/school-logo.png", // Replace with actual logo path
        tagline: "Nurturing Minds, Building Futures",
        primaryColor: "#2563eb", // Blue - change to school colors
        secondaryColor: "#f59e0b", // Amber
        heroImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        phone: "+1 (555) 123-4567",
        email: "info@excellenceacademy.edu",
        address: "123 Education Street, Learning City, LC 12345"
    };

    const quickActions = [
        {
            title: "Student Portal",
            description: "Access grades, assignments, and schedules",
            icon: <GraduationCap className="h-8 w-8" />,
            href: "/student-portal",
            color: "bg-blue-50 text-blue-600"
        },
        {
            title: "Parent Dashboard",
            description: "Monitor your child's academic progress",
            icon: <Users className="h-8 w-8" />,
            href: "/parent-dashboard",
            color: "bg-green-50 text-green-600"
        },
        {
            title: "Teacher Hub",
            description: "Manage classes, grades, and resources",
            icon: <BookOpen className="h-8 w-8" />,
            href: "/teacher-hub",
            color: "bg-purple-50 text-purple-600"
        },
        {
            title: "Academic Calendar",
            description: "View important dates and events",
            icon: <Calendar className="h-8 w-8" />,
            href: "/calendar",
            color: "bg-orange-50 text-orange-600"
        }
    ];

    const features = [
        {
            title: "Academic Excellence",
            description: "Comprehensive curriculum designed to foster critical thinking and innovation",
            icon: <Award className="h-6 w-6" />
        },
        {
            title: "Smart Communication",
            description: "Real-time notifications and seamless parent-teacher communication",
            icon: <Bell className="h-6 w-6" />
        },
        {
            title: "Digital Learning",
            description: "Modern technology integration for enhanced learning experiences",
            icon: <BookOpen className="h-6 w-6" />
        }
    ];

    const stats = [
        { label: "Active Students", value: "2,847" },
        { label: "Qualified Teachers", value: "156" },
        { label: "Academic Programs", value: "12" },
        { label: "Years of Excellence", value: "25+" }
    ];

    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                {/* Header */}
                <header className="bg-white shadow-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            {/* Logo */}
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                                    <GraduationCap className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">{schoolConfig.name}</h1>
                                    <p className="text-xs text-gray-500">{schoolConfig.tagline}</p>
                                </div>
                            </div>

                            {/* Desktop Navigation */}
                            <nav className="hidden md:flex items-center space-x-6">
                                {auth.user ? (
                                    <Link
                                        href={route('admin.dashboard')}
                                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Dashboard
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </Link>
                                ) : (
                                    <div className="flex items-center space-x-4">
                                        <Link
                                            href={route('login')}
                                            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Get Started
                                        </Link>
                                    </div>
                                )}
                            </nav>

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                            >
                                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>

                        {/* Mobile Navigation */}
                        {mobileMenuOpen && (
                            <div className="md:hidden py-4 border-t border-gray-200">
                                <div className="flex flex-col space-y-3">
                                    {auth.user ? (
                                        <Link
                                            href={route('admin.dashboard')}
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-center"
                                        >
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={route('login')}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors text-center"
                                            >
                                                Sign In
                                            </Link>
                                            <Link
                                                href={route('register')}
                                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-center"
                                            >
                                                Get Started
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative py-20 lg:py-32 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                    Welcome to <span className="text-blue-600">{schoolConfig.name}</span>
                                </h1>
                                <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                                    {schoolConfig.tagline} - Your comprehensive school management platform designed to enhance education through technology.
                                </p>
                                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                    {!auth.user && (
                                        <>
                                            <Link
                                                href={route('register')}
                                                className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 text-center"
                                            >
                                                Get Started Today
                                            </Link>
                                            <Link
                                                href={route('login')}
                                                className="px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200 text-center"
                                            >
                                                Sign In
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="lg:pl-12">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl transform rotate-3"></div>
                                    <img
                                        src={schoolConfig.heroImage}
                                        alt="School Environment"
                                        className="relative w-full h-96 object-cover rounded-3xl shadow-2xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
                                        {stat.value}
                                    </div>
                                    <div className="text-gray-600 font-medium">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Quick Actions Grid */}
                <section className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                Quick Access
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Choose your role to access the appropriate dashboard and tools
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {quickActions.map((action, index) => (
                                <Link
                                    key={index}
                                    href={action.href}
                                    className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                                >
                                    <div className={`w-16 h-16 ${action.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                        {action.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                        {action.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        {action.description}
                                    </p>
                                    <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                                        Access Now
                                        <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                Why Choose {schoolConfig.name}?
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                We provide comprehensive educational solutions that empower students, parents, and teachers
                            </p>
                        </div>
                        <div className="grid lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <div key={index} className="text-center p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-300">
                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center text-white">
                            <h2 className="text-3xl lg:text-4xl font-bold mb-8">
                                Ready to Get Started?
                            </h2>
                            <p className="text-xl mb-12 text-blue-100 max-w-2xl mx-auto">
                                Join thousands of students, parents, and educators who trust our platform for their educational journey.
                            </p>
                            {!auth.user && (
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        href={route('register')}
                                        className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Create Account
                                    </Link>
                                    <Link
                                        href={route('login')}
                                        className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-4 gap-8">
                            <div className="lg:col-span-2">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                                        <GraduationCap className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{schoolConfig.name}</h3>
                                        <p className="text-gray-400 text-sm">{schoolConfig.tagline}</p>
                                    </div>
                                </div>
                                <p className="text-gray-400 mb-6 max-w-md">
                                    Empowering education through innovative technology solutions. Building the future of learning, one student at a time.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Contact Info</h4>
                                <div className="space-y-2 text-gray-400">
                                    <p>{schoolConfig.phone}</p>
                                    <p>{schoolConfig.email}</p>
                                    <p className="text-sm">{schoolConfig.address}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Quick Links</h4>
                                <div className="space-y-2">
                                    <a href="#" className="block text-gray-400 hover:text-white transition-colors">About Us</a>
                                    <a href="#" className="block text-gray-400 hover:text-white transition-colors">Academic Programs</a>
                                    <a href="#" className="block text-gray-400 hover:text-white transition-colors">Admissions</a>
                                    <a href="#" className="block text-gray-400 hover:text-white transition-colors">Contact</a>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
                            <p className="text-gray-400 text-sm">
                                © 2025 {schoolConfig.name}. All rights reserved.
                            </p>
                            <p className="text-gray-500 text-xs mt-2 sm:mt-0">
                                Laravel v{laravelVersion} | PHP v{phpVersion}
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}