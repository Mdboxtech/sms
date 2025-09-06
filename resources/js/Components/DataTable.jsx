import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import Pagination from './Pagination';

export default function DataTable({ 
    data, 
    columns, 
    searchable = true, 
    searchPlaceholder = "Search...",
    preserveState = true,
    preserveScroll = true,
    currentUrl = null
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

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-900 dark:text-gray-800">
                    <thead className="text-xs text-gray-800 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-800">
                        <tr>
                            {columns.map((column, index) => (
                                <th key={index} scope="col" className="px-6 py-3">
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
                                    className="border-b text-gray-950 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-600"
                                >
                                    {columns.map((column, colIndex) => (
                                        <td key={colIndex} className="px-6 py-4 text-gray-900 dark:text-gray-800">
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
