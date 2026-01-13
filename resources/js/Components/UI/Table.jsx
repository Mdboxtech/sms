import { useState } from 'react';
import Pagination from '@/Components/Pagination';

export default function Table({
    columns,
    data,
    actions = null,
    pagination = null,
    className = '',
    mobileCardTitle = null // Column key or render function for mobile card title
}) {
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    const handleSort = (column) => {
        if (column.sortable) {
            if (sortColumn === column.key) {
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
            } else {
                setSortColumn(column.key);
                setSortDirection('asc');
            }
        }
    };

    // Get mobile title for a row
    const getMobileTitle = (row) => {
        if (mobileCardTitle) {
            if (typeof mobileCardTitle === 'function') {
                return mobileCardTitle(row);
            }
            const col = columns.find(c => c.key === mobileCardTitle);
            if (col && col.render) {
                return col.render(row);
            }
            return row[mobileCardTitle];
        }
        // Default: use first column
        const firstCol = columns[0];
        if (firstCol.render) {
            return firstCol.render(row);
        }
        return row[firstCol.key];
    };

    // Get columns for mobile display (limit to 4)
    const mobileColumns = columns.slice(0, 4);

    return (
        <div className={`overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg ${className}`}>
            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    scope="col"
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${column.sortable ? 'cursor-pointer hover:text-gray-700' : ''
                                        }`}
                                    onClick={() => handleSort(column)}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{column.label}</span>
                                        {column.sortable && sortColumn === column.key && (
                                            <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions && <th scope="col" className="relative px-6 py-3" />}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data && data.length > 0 ? (
                            data.map((row, rowIndex) => (
                                <tr key={row.id || rowIndex} className="hover:bg-gray-50">
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                        >
                                            {column.render ? column.render(row) : row[column.key]}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {actions(row)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-sm font-medium text-gray-900 mb-1">No data available</p>
                                        <p className="text-sm text-gray-500">No records found matching your criteria.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View - Shown only on mobile */}
            <div className="md:hidden bg-white">
                {data && data.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {data.map((row, rowIndex) => (
                            <div key={row.id || rowIndex} className="p-4 hover:bg-gray-50">
                                {/* Card Header - Primary info with actions */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="font-medium text-gray-900 text-sm flex-1 min-w-0">
                                        {getMobileTitle(row)}
                                    </div>
                                    {actions && (
                                        <div className="flex-shrink-0 ml-3">
                                            {actions(row)}
                                        </div>
                                    )}
                                </div>

                                {/* Card Body - Other fields */}
                                <div className="space-y-2">
                                    {mobileColumns.slice(1).map((column) => (
                                        <div key={column.key} className="flex justify-between items-start text-sm">
                                            <span className="text-gray-500 flex-shrink-0 mr-2">{column.label}:</span>
                                            <span className="text-gray-900 text-right truncate">
                                                {column.render ? column.render(row) : row[column.key]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="px-4 py-12 text-center text-gray-500">
                        <svg className="w-12 h-12 text-gray-400 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm font-medium text-gray-900 mb-1">No data available</p>
                        <p className="text-sm text-gray-500">No records found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Pagination Component */}
            {pagination && pagination.links && (
                <Pagination
                    links={pagination.links}
                    from={pagination.from}
                    to={pagination.to}
                    total={pagination.total}
                    currentPage={pagination.current_page}
                    lastPage={pagination.last_page}
                    perPage={pagination.per_page}
                    preserveState={true}
                    preserveScroll={true}
                />
            )}
        </div>
    );
}

