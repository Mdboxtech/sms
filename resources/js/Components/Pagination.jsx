import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ 
    links, 
    from, 
    to, 
    total, 
    currentPage, 
    lastPage, 
    perPage,
    preserveState = true,
    preserveScroll = true 
}) {
    // Validate that links is an array and has content
    if (!Array.isArray(links) || links.length <= 3) {
        return null;
    }

    // Smart pagination logic - show max 7 page numbers
    const renderPageNumbers = () => {
        // Ensure links is an array before processing
        if (!Array.isArray(links) || links.length < 3) {
            return null;
        }
        
        const pageLinks = links.slice(1, -1); // Remove prev/next links
        const totalPages = lastPage;
        const current = currentPage;
        
        // If we have 7 or fewer pages, show all
        if (totalPages <= 7) {
            return pageLinks.map((link, index) => (
                <span key={index}>
                    {link.url ? (
                        <Link
                            href={link.url}
                            preserveState={preserveState}
                            preserveScroll={preserveScroll}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                                link.active
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-gray-50 text-sm font-medium text-gray-300">
                            ...
                        </span>
                    )}
                </span>
            ));
        }

        // Smart pagination for more than 7 pages
        const pages = [];
        
        // Always show first page
        if (current > 3) {
            pages.push(
                <Link
                    key="page-1"
                    href={pageLinks[0].url}
                    preserveState={preserveState}
                    preserveScroll={preserveScroll}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                    1
                </Link>
            );

            // Add ellipsis if needed
            if (current > 4) {
                pages.push(
                    <span key="ellipsis-start" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-gray-50 text-sm font-medium text-gray-300">
                        ...
                    </span>
                );
            }
        }

        // Show pages around current page
        const start = Math.max(1, current - 2);
        const end = Math.min(totalPages, current + 2);

        for (let i = start; i <= end; i++) {
            const pageLink = pageLinks[i - 1];
            if (pageLink) {
                pages.push(
                    <Link
                        key={`page-${i}`}
                        href={pageLink.url}
                        preserveState={preserveState}
                        preserveScroll={preserveScroll}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                            pageLink.active
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        {i}
                    </Link>
                );
            }
        }

        // Always show last page
        if (current < totalPages - 2) {
            // Add ellipsis if needed
            if (current < totalPages - 3) {
                pages.push(
                    <span key="ellipsis-end" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-gray-50 text-sm font-medium text-gray-300">
                        ...
                    </span>
                );
            }

            pages.push(
                <Link
                    key={`page-${totalPages}`}
                    href={pageLinks[totalPages - 1].url}
                    preserveState={preserveState}
                    preserveScroll={preserveScroll}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                    {totalPages}
                </Link>
            );
        }

        return pages;
    };

    return (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
                {/* Mobile pagination */}
                {links[0].url ? (
                    <Link
                        href={links[0].url}
                        preserveState={preserveState}
                        preserveScroll={preserveScroll}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Previous
                    </Link>
                ) : (
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-gray-50 cursor-not-allowed">
                        Previous
                    </span>
                )}
                
                {links[links.length - 1].url ? (
                    <Link
                        href={links[links.length - 1].url}
                        preserveState={preserveState}
                        preserveScroll={preserveScroll}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Next
                    </Link>
                ) : (
                    <span className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-gray-50 cursor-not-allowed">
                        Next
                    </span>
                )}
            </div>
            
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">{from}</span>
                        {' '}to{' '}
                        <span className="font-medium">{to}</span>
                        {' '}of{' '}
                        <span className="font-medium">{total}</span>
                        {' '}results
                    </p>
                </div>
                
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        {/* Previous Page Link */}
                        {links[0].url ? (
                            <Link
                                href={links[0].url}
                                preserveState={preserveState}
                                preserveScroll={preserveScroll}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </Link>
                        ) : (
                            <span className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-gray-50 text-sm font-medium text-gray-300 cursor-not-allowed">
                                <span className="sr-only">Previous</span>
                                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </span>
                        )}

                        {/* Page Number Links */}
                        {renderPageNumbers()}

                        {/* Next Page Link */}
                        {links[links.length - 1].url ? (
                            <Link
                                href={links[links.length - 1].url}
                                preserveState={preserveState}
                                preserveScroll={preserveScroll}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRight className="h-5 w-5" aria-hidden="true" />
                            </Link>
                        ) : (
                            <span className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-gray-50 text-sm font-medium text-gray-300 cursor-not-allowed">
                                <span className="sr-only">Next</span>
                                <ChevronRight className="h-5 w-5" aria-hidden="true" />
                            </span>
                        )}
                    </nav>
                </div>
            </div>
        </div>
    );
}
