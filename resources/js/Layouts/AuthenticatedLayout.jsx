import { useState } from 'react';
import { Link } from '@inertiajs/react';
import Sidebar from '@/Components/Layout/Sidebar';
import Header from '@/Components/Layout/Header';
import AppWrapper from '@/Components/AppWrapper';

export default function AuthenticatedLayout({ children }) {
    return (
        <AppWrapper>
            <div className="flex h-screen bg-gray-100">
                <Sidebar />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </AppWrapper>
    );
}
