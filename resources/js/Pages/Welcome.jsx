import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    GraduationCap, Users, BookOpen, Calendar, Award, Bell,
    ChevronRight, Menu, X, Sparkles, ArrowRight, Check,
    Shield, Zap, BarChart3, Globe, Star
} from 'lucide-react';

export default function Welcome({ auth, laravelVersion, phpVersion, appSettings }) {
    const { themeSettings } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Track scroll for header effects
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Dynamic theme colors
    const primaryStart = themeSettings?.primary_start || '#6366f1';
    const primaryEnd = themeSettings?.primary_end || '#8b5cf6';
    const secondaryStart = themeSettings?.secondary_start || '#ec4899';
    const secondaryEnd = themeSettings?.secondary_end || '#f59e0b';
    const accentColor = themeSettings?.accent_color || '#10b981';

    // Use dynamic school configuration from settings
    const schoolConfig = {
        name: appSettings?.school_name || "Excellence Academy",
        logo: appSettings?.school_logo ? `/storage/${appSettings.school_logo}` : null,
        tagline: appSettings?.school_tagline || "Nurturing Minds, Building Futures",
        phone: appSettings?.school_phone || "+1 (555) 123-4567",
        email: appSettings?.school_email || "info@excellenceacademy.edu",
        address: appSettings?.school_address || "123 Education Street, Learning City"
    };

    const features = [
        {
            title: "Smart Student Management",
            description: "Comprehensive student profiles, attendance tracking, and performance analytics all in one place.",
            icon: <Users className="h-6 w-6" />,
            gradient: `linear-gradient(135deg, ${primaryStart}, ${primaryEnd})`
        },
        {
            title: "Computer-Based Testing",
            description: "Create and manage exams digitally with auto-grading, detailed analytics, and anti-cheating measures.",
            icon: <BookOpen className="h-6 w-6" />,
            gradient: `linear-gradient(135deg, ${secondaryStart}, ${secondaryEnd})`
        },
        {
            title: "Real-Time Analytics",
            description: "Track academic performance with beautiful charts, reports, and actionable insights.",
            icon: <BarChart3 className="h-6 w-6" />,
            gradient: `linear-gradient(135deg, ${accentColor}, #34d399)`
        },
        {
            title: "Secure Payments",
            description: "Integrated payment processing for fees with receipts, notifications, and financial reports.",
            icon: <Shield className="h-6 w-6" />,
            gradient: `linear-gradient(135deg, #f97316, #eab308)`
        },
        {
            title: "Instant Notifications",
            description: "Keep everyone informed with real-time alerts for grades, events, and important updates.",
            icon: <Bell className="h-6 w-6" />,
            gradient: `linear-gradient(135deg, #06b6d4, #3b82f6)`
        },
        {
            title: "Multi-Role Access",
            description: "Tailored dashboards for students, teachers, parents, and administrators.",
            icon: <Globe className="h-6 w-6" />,
            gradient: `linear-gradient(135deg, #8b5cf6, #d946ef)`
        }
    ];

    const stats = [
        { value: "99.9%", label: "Uptime", icon: <Zap className="h-5 w-5" /> },
        { value: "50K+", label: "Students", icon: <Users className="h-5 w-5" /> },
        { value: "500+", label: "Schools", icon: <GraduationCap className="h-5 w-5" /> },
        { value: "4.9", label: "Rating", icon: <Star className="h-5 w-5" /> }
    ];

    const testimonials = [
        {
            quote: "This system transformed how we manage our school. Everything is now seamless and efficient.",
            author: "Dr. Sarah Johnson",
            role: "School Principal",
            avatar: "SJ"
        },
        {
            quote: "The CBT feature alone saved us countless hours. Students love the modern interface!",
            author: "Mr. David Chen",
            role: "Head of Academics",
            avatar: "DC"
        },
        {
            quote: "Finally, a school system that parents can actually use. I can track my child's progress easily.",
            author: "Mrs. Amara Ibrahim",
            role: "Parent",
            avatar: "AI"
        }
    ];

    return (
        <>
            <Head title={`Welcome - ${schoolConfig.name}`} />

            {/* Background with animated gradient */}
            <div className="min-h-screen relative overflow-hidden">
                {/* Animated background gradient */}
                <div
                    className="fixed inset-0 -z-10"
                    style={{
                        background: `
                            radial-gradient(circle at 20% 20%, ${primaryStart}15 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, ${secondaryStart}15 0%, transparent 50%),
                            radial-gradient(circle at 50% 50%, ${accentColor}10 0%, transparent 50%),
                            linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)
                        `
                    }}
                />

                {/* Floating particles effect */}
                <div className="fixed inset-0 -z-10 overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full opacity-20 animate-pulse"
                            style={{
                                width: Math.random() * 100 + 50,
                                height: Math.random() * 100 + 50,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                background: i % 2 === 0
                                    ? `linear-gradient(135deg, ${primaryStart}, ${primaryEnd})`
                                    : `linear-gradient(135deg, ${secondaryStart}, ${secondaryEnd})`,
                                filter: 'blur(40px)',
                                animationDelay: `${i * 0.5}s`,
                                animationDuration: `${3 + Math.random() * 4}s`
                            }}
                        />
                    ))}
                </div>

                {/* Header */}
                <header
                    className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                            ? 'bg-slate-900/80 backdrop-blur-xl border-b border-white/10 shadow-xl'
                            : 'bg-transparent'
                        }`}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-20">
                            {/* Logo */}
                            <div className="flex items-center space-x-3">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                                    style={{ background: `linear-gradient(135deg, ${primaryStart}, ${primaryEnd})` }}
                                >
                                    {schoolConfig.logo ? (
                                        <img src={schoolConfig.logo} alt="Logo" className="w-8 h-8 object-contain" />
                                    ) : (
                                        <GraduationCap className="h-7 w-7 text-white" />
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">{schoolConfig.name}</h1>
                                    <p className="text-xs text-slate-400 hidden sm:block">{schoolConfig.tagline}</p>
                                </div>
                            </div>

                            {/* Desktop Navigation */}
                            <nav className="hidden md:flex items-center space-x-6">
                                <a href="#features" className="text-slate-300 hover:text-white transition-colors font-medium">Features</a>
                                <a href="#testimonials" className="text-slate-300 hover:text-white transition-colors font-medium">Testimonials</a>
                                <a href="#contact" className="text-slate-300 hover:text-white transition-colors font-medium">Contact</a>

                                {auth.user ? (
                                    <Link
                                        href={route('admin.dashboard')}
                                        className="px-5 py-2.5 rounded-xl font-semibold text-white flex items-center space-x-2 transition-all duration-300 hover:scale-105 shadow-lg"
                                        style={{ background: `linear-gradient(135deg, ${primaryStart}, ${primaryEnd})` }}
                                    >
                                        <span>Dashboard</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <div className="flex items-center space-x-4">
                                        <Link
                                            href={route('login')}
                                            className="text-slate-300 hover:text-white font-medium transition-colors"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="px-5 py-2.5 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                                            style={{ background: `linear-gradient(135deg, ${primaryStart}, ${primaryEnd})` }}
                                        >
                                            Get Started Free
                                        </Link>
                                    </div>
                                )}
                            </nav>

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 rounded-xl text-white bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>

                        {/* Mobile Navigation */}
                        {mobileMenuOpen && (
                            <div className="md:hidden py-6 border-t border-white/10 animate-fadeIn">
                                <div className="flex flex-col space-y-4">
                                    <a href="#features" className="text-slate-300 hover:text-white transition-colors font-medium py-2">Features</a>
                                    <a href="#testimonials" className="text-slate-300 hover:text-white transition-colors font-medium py-2">Testimonials</a>
                                    {auth.user ? (
                                        <Link
                                            href={route('admin.dashboard')}
                                            className="px-5 py-3 rounded-xl font-semibold text-white text-center transition-all"
                                            style={{ background: `linear-gradient(135deg, ${primaryStart}, ${primaryEnd})` }}
                                        >
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link href={route('login')} className="text-slate-300 hover:text-white font-medium py-2 text-center">
                                                Sign In
                                            </Link>
                                            <Link
                                                href={route('register')}
                                                className="px-5 py-3 rounded-xl font-semibold text-white text-center"
                                                style={{ background: `linear-gradient(135deg, ${primaryStart}, ${primaryEnd})` }}
                                            >
                                                Get Started Free
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="text-center lg:text-left">
                                {/* Badge */}
                                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-8">
                                    <Sparkles className="h-4 w-4 mr-2" style={{ color: accentColor }} />
                                    <span>Modern School Management</span>
                                </div>

                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                                    Transform Your School with{' '}
                                    <span
                                        className="bg-clip-text text-transparent"
                                        style={{ backgroundImage: `linear-gradient(135deg, ${primaryStart}, ${primaryEnd})` }}
                                    >
                                        Smart Technology
                                    </span>
                                </h1>

                                <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0">
                                    Streamline administration, enhance learning, and connect your entire school community with our comprehensive management platform.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    {!auth.user && (
                                        <>
                                            <Link
                                                href={route('register')}
                                                className="px-8 py-4 rounded-xl font-semibold text-white flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl group"
                                                style={{ background: `linear-gradient(135deg, ${primaryStart}, ${primaryEnd})` }}
                                            >
                                                <span>Start Free Trial</span>
                                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                            <Link
                                                href={route('login')}
                                                className="px-8 py-4 rounded-xl font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 text-center"
                                            >
                                                Sign In
                                            </Link>
                                        </>
                                    )}
                                    {auth.user && (
                                        <Link
                                            href={route('admin.dashboard')}
                                            className="px-8 py-4 rounded-xl font-semibold text-white flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 shadow-xl group"
                                            style={{ background: `linear-gradient(135deg, ${primaryStart}, ${primaryEnd})` }}
                                        >
                                            <span>Go to Dashboard</span>
                                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    )}
                                </div>

                                {/* Trust indicators */}
                                <div className="mt-12 flex items-center justify-center lg:justify-start space-x-6 text-slate-400">
                                    <div className="flex items-center space-x-2">
                                        <Check className="h-5 w-5" style={{ color: accentColor }} />
                                        <span className="text-sm">No credit card required</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Check className="h-5 w-5" style={{ color: accentColor }} />
                                        <span className="text-sm">Free forever plan</span>
                                    </div>
                                </div>
                            </div>

                            {/* Hero Visual */}
                            <div className="relative hidden lg:block">
                                <div className="relative">
                                    {/* Glow effect */}
                                    <div
                                        className="absolute inset-0 rounded-3xl blur-3xl opacity-30"
                                        style={{ background: `linear-gradient(135deg, ${primaryStart}, ${secondaryEnd})` }}
                                    />

                                    {/* Dashboard mockup */}
                                    <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl">
                                        <div className="flex items-center space-x-2 mb-6">
                                            <div className="w-3 h-3 rounded-full bg-red-500" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                            <div className="w-3 h-3 rounded-full bg-green-500" />
                                            <div className="flex-1 text-center text-slate-500 text-xs">Dashboard Preview</div>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Stats cards */}
                                            <div className="grid grid-cols-3 gap-3">
                                                {['Students: 2,847', 'Teachers: 156', 'Classes: 48'].map((stat, i) => (
                                                    <div key={i} className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                                                        <div className="text-sm font-semibold text-white">{stat.split(': ')[1]}</div>
                                                        <div className="text-xs text-slate-400">{stat.split(': ')[0]}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Chart placeholder */}
                                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                                <div className="flex items-end justify-around h-24 space-x-2">
                                                    {[60, 80, 45, 90, 70, 85, 55].map((h, i) => (
                                                        <div
                                                            key={i}
                                                            className="w-6 rounded-t-lg transition-all"
                                                            style={{
                                                                height: `${h}%`,
                                                                background: `linear-gradient(to top, ${primaryStart}, ${primaryEnd})`
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="text-center text-xs text-slate-400 mt-3">Weekly Performance</div>
                                            </div>

                                            {/* List items */}
                                            <div className="space-y-2">
                                                {['Recent Activity', 'Pending Tasks', 'Notifications'].map((item, i) => (
                                                    <div key={i} className="bg-white/5 rounded-xl p-3 flex items-center space-x-3 border border-white/10">
                                                        <div
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                            style={{ background: `linear-gradient(135deg, ${primaryStart}40, ${primaryEnd}40)` }}
                                                        >
                                                            <div className="w-2 h-2 rounded-full" style={{ background: primaryStart }} />
                                                        </div>
                                                        <div className="text-sm text-slate-300">{item}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center hover:bg-white/10 transition-all duration-300 hover:scale-105"
                                >
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                                        style={{ background: `linear-gradient(135deg, ${primaryStart}30, ${primaryEnd}30)` }}
                                    >
                                        <span style={{ color: primaryStart }}>{stat.icon}</span>
                                    </div>
                                    <div className="text-3xl lg:text-4xl font-bold text-white mb-1">{stat.value}</div>
                                    <div className="text-slate-400 font-medium">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6">
                                <Zap className="h-4 w-4 mr-2" style={{ color: accentColor }} />
                                <span>Powerful Features</span>
                            </div>
                            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                                Everything You Need to{' '}
                                <span
                                    className="bg-clip-text text-transparent"
                                    style={{ backgroundImage: `linear-gradient(135deg, ${primaryStart}, ${primaryEnd})` }}
                                >
                                    Run Your School
                                </span>
                            </h2>
                            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                                Our comprehensive platform provides all the tools you need to manage students, teachers, exams, and more.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:bg-white/10"
                                >
                                    <div
                                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                                        style={{ background: feature.gradient }}
                                    >
                                        <span className="text-white">{feature.icon}</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                                    <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section id="testimonials" className="py-24 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                                Loved by Schools{' '}
                                <span
                                    className="bg-clip-text text-transparent"
                                    style={{ backgroundImage: `linear-gradient(135deg, ${secondaryStart}, ${secondaryEnd})` }}
                                >
                                    Everywhere
                                </span>
                            </h2>
                            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                                See what educators and parents say about their experience.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {testimonials.map((testimonial, index) => (
                                <div
                                    key={index}
                                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
                                >
                                    <div className="flex mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-slate-300 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white"
                                            style={{ background: `linear-gradient(135deg, ${primaryStart}, ${primaryEnd})` }}
                                        >
                                            {testimonial.avatar}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white">{testimonial.author}</div>
                                            <div className="text-sm text-slate-400">{testimonial.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 relative">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div
                            className="rounded-3xl p-12 text-center relative overflow-hidden"
                            style={{ background: `linear-gradient(135deg, ${primaryStart}, ${primaryEnd})` }}
                        >
                            {/* Decorative elements */}
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
                                <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl" />
                            </div>

                            <div className="relative">
                                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                                    Ready to Transform Your School?
                                </h2>
                                <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                                    Join thousands of schools already using our platform to streamline their operations.
                                </p>
                                {!auth.user && (
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Link
                                            href={route('register')}
                                            className="px-8 py-4 bg-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-xl flex items-center justify-center space-x-2"
                                            style={{ color: primaryStart }}
                                        >
                                            <span>Get Started Free</span>
                                            <ArrowRight className="h-5 w-5" />
                                        </Link>
                                        <Link
                                            href={route('login')}
                                            className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
                                        >
                                            Sign In
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer id="contact" className="py-16 border-t border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-4 gap-12">
                            <div className="lg:col-span-2">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                                        style={{ background: `linear-gradient(135deg, ${primaryStart}, ${primaryEnd})` }}
                                    >
                                        <GraduationCap className="h-7 w-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{schoolConfig.name}</h3>
                                        <p className="text-slate-400 text-sm">{schoolConfig.tagline}</p>
                                    </div>
                                </div>
                                <p className="text-slate-400 max-w-md leading-relaxed">
                                    Empowering education through innovative technology solutions. Building the future of learning, one student at a time.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-white mb-4">Contact Info</h4>
                                <div className="space-y-3 text-slate-400">
                                    <p>{schoolConfig.phone}</p>
                                    <p>{schoolConfig.email}</p>
                                    <p className="text-sm">{schoolConfig.address}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-white mb-4">Quick Links</h4>
                                <div className="space-y-3">
                                    <a href="#features" className="block text-slate-400 hover:text-white transition-colors">Features</a>
                                    <a href="#testimonials" className="block text-slate-400 hover:text-white transition-colors">Testimonials</a>
                                    <Link href={route('login')} className="block text-slate-400 hover:text-white transition-colors">Sign In</Link>
                                    <Link href={route('register')} className="block text-slate-400 hover:text-white transition-colors">Register</Link>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
                            <p className="text-slate-400 text-sm">
                                © {new Date().getFullYear()} {schoolConfig.name}. All rights reserved.
                            </p>
                            <p className="text-slate-500 text-xs mt-2 sm:mt-0">
                                Powered by Laravel v{laravelVersion}
                            </p>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Custom styles for animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </>
    );
}