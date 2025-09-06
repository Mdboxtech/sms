import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import AppWrapper from '@/Components/AppWrapper';

export default function GuestLayout({ children }) {
    return (
        <AppWrapper>
            <GuestLayoutContent>{children}</GuestLayoutContent>
        </AppWrapper>
    );
}

function GuestLayoutContent({ children }) {
    // This component will receive theme settings through ThemeProvider context
    // We'll create a simpler version that uses CSS variables set by ThemeProvider
    
    return (
        <div 
            className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
            style={{ background: 'var(--theme-background-gradient, linear-gradient(135deg, #f8fafc, #e2e8f0))' }}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30">
                <div 
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(135deg, var(--theme-primary-start, #6366f1)10, var(--theme-primary-end, #8b5cf6)10)'
                    }}
                ></div>
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(148 163 184 / 0.05)'%3E%3Cpath d='m0 .5 32 32M32 .5 0 32'/%3E%3C/svg%3E")`,
                    backgroundSize: '32px 32px'
                }}></div>
            </div>
            
            <div className="relative z-10">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block group">
                        <div 
                            className="mx-auto w-24 h-24 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105 flex items-center justify-center mb-6"
                            style={{ background: 'var(--theme-primary-gradient, linear-gradient(135deg, #6366f1, #8b5cf6))' }}
                        >
                            <ApplicationLogo className="h-12 w-12 text-white" />
                        </div>
                    </Link>
                    
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        School Management System
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Welcome to your education portal
                    </p>
                </div>

                {/* Main Content Card */}
                <div className="max-w-md mx-auto">
                    <div className="bg-white/70 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 overflow-hidden">
                        {/* Card Header with Gradient */}
                        <div 
                            className="h-2"
                            style={{ background: 'var(--theme-primary-gradient, linear-gradient(135deg, #6366f1, #8b5cf6))' }}
                        ></div>
                        
                        {/* Form Content */}
                        <div className="px-8 py-8">
                            {children}
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="text-center mt-8">
                        <p className="text-gray-500 text-sm">
                            © 2024 School Management System. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Floating Elements for Visual Appeal */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
    );
}
