import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Search, ChevronRight } from 'lucide-react';
import Pagination from './Pagination';

export default function DataTable({
    data,
    columns,
    searchable = true,
    searchPlaceholder = "Search...",
    preserveState = true,
    preserveScroll = true,
    currentUrl = null,
    mobileCardTitle = null // Column accessor or render function for mobile card title
}) {
    const [search, setSearch] = useState('');

    const handleSearch = (searchTerm) => {
        setSearch(searchTerm);

        // Get current URL parameters
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);

        if (searchTerm) {
            params.set('search', searchTerm);
        } else {
            params.delete('search');
        }

        params.delete('page'); // Reset to first page when searching

        // Navigate with new search parameters
        router.get(`${url.pathname}?${params.toString()}`, {}, {
            preserveState,
            preserveScroll,
            replace: true
        });
    };

    // Handle pagination data
    const isPaginated = data && typeof data === 'object' && data.data !== undefined;
    const tableData = isPaginated ? data.data : (Array.isArray(data) ? data : []);

    // Get mobile title for a row
    const getMobileTitle = (row) => {
        if (mobileCardTitle) {
            if (typeof mobileCardTitle === 'function') {
                return mobileCardTitle(row);
            }
            return row[mobileCardTitle];
        }
        // Default: use first column
        const firstCol = columns[0];
        if (firstCol.render) {
            return firstCol.render(row);
        }
        return row[firstCol.accessor];
    };

    // Filter columns for mobile display (exclude actions and very long content)
    const mobileColumns = columns.filter(col =>
        col.accessor !== 'actions' &&
        col.header?.toLowerCase() !== 'actions'
    ).slice(0, 4); // Show max 4 fields on mobile cards

    return (
        <div className="relative">
            {/* Search Bar */}
            {searchable && (
                <div className="p-4 border-b border-gray-200">
                    <div className="relative max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch(search);
                                }
                            }}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>
            )}

            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-900">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            {columns.map((column, index) => (
                                <th key={index} scope="col" className="px-6 py-3 whitespace-nowrap">
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.length > 0 ? (
                            tableData.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className="border-b hover:bg-gray-50"
                                >
                                    {columns.map((column, colIndex) => (
                                        <td key={colIndex} className="px-6 py-4">
                                            {column.render ? column.render(row) : row[column.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View - Shown only on mobile */}
            <div className="md:hidden">
                {tableData.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {tableData.map((row, rowIndex) => (
                            <div key={rowIndex} className="p-4 hover:bg-gray-50">
                                {/* Card Header - Primary info */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="font-medium text-gray-900 text-sm">
                                        {getMobileTitle(row)}
                                    </div>
                                    {/* Actions column if exists */}
                                    {columns.find(col => col.accessor === 'actions' || col.header?.toLowerCase() === 'actions') && (
                                        <div className="flex-shrink-0 ml-2">
                                            {columns.find(col => col.accessor === 'actions' || col.header?.toLowerCase() === 'actions').render(row)}
                                        </div>
                                    )}
                                </div>

                                {/* Card Body - Other fields */}
                                <div className="space-y-2">
                                    {mobileColumns.slice(1).map((column, colIndex) => (
                                        <div key={colIndex} className="flex justify-between items-start text-sm">
                                            <span className="text-gray-500 flex-shrink-0 mr-2">{column.header}:</span>
                                            <span className="text-gray-900 text-right">
                                                {column.render ? column.render(row) : row[column.accessor]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                        No data available
                    </div>
                )}
            </div>

            {/* Pagination */}
            {isPaginated && (
                <Pagination
                    links={data.links}
                    from={data.from}
                    to={data.to}
                    total={data.total}
                    currentPage={data.current_page}
                    lastPage={data.last_page}
                    perPage={data.per_page}
                    preserveState={preserveState}
                    preserveScroll={preserveScroll}
                />
            )}
        </div>
    );
}

