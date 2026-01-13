import { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import Sidebar from '@/Components/Layout/Sidebar';
import Header from '@/Components/Layout/Header';
import AppWrapper from '@/Components/AppWrapper';

export default function AuthenticatedLayout({ children }) {
    // Initialize sidebar based on screen width - start closed on mobile
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return false; // Default to closed for SSR
    });

    // Auto-collapse sidebar on mobile and close on page navigation
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            }
        };

        handleResize(); // Check on initial load

        window.addEventListener('resize', handleResize);

        // Close sidebar on mobile when navigating to a new page
        const removeListener = router.on('navigate', () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            }
        });

        return () => {
            window.removeEventListener('resize', handleResize);
            removeListener();
        };
    }, []);

    return (
        <AppWrapper>
            <div className="flex h-screen bg-gray-100 overflow-hidden print:block print:h-auto print:overflow-visible print:bg-white">
                <div className="print:hidden">
                    <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
                </div>

                <div className="flex-1 flex flex-col overflow-hidden min-w-0 print:block print:overflow-visible">
                    <div className="print:hidden">
                        <Header onMenuClick={() => setSidebarOpen(true)} />
                    </div>

                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 print:p-0 print:overflow-visible">
                        <div className="max-w-7xl mx-auto w-full print:max-w-none">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </AppWrapper>
    );
}
