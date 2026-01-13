import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import Sidebar from '@/Components/Layout/Sidebar';
import Header from '@/Components/Layout/Header';
import AppWrapper from '@/Components/AppWrapper';

export default function AuthenticatedLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Auto-collapse sidebar on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            }
        };

        handleResize(); // Check on initial load
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <AppWrapper>
            <div className="flex h-screen bg-gray-100 overflow-hidden">
                <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

                <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                    <Header onMenuClick={() => setSidebarOpen(true)} />

                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                        <div className="max-w-7xl mx-auto w-full">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </AppWrapper>
    );
}

