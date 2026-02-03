'use client';

import Image from 'next/image';
import { TableProps, TableColumn } from './Table.types';
import { useLocale } from '@/shared/hooks';
import { getTranslation } from '@/shared/i18n';


export function Table<T extends object>({
    data,
    columns,
    rowKey,
    title,
    headerAction,
    footerContent,
    pagination,
    sorting,
    onRowClick,
    rowActions,
    actionsHeader = 'الإجراءات',
    className = '',
    loading = false,
    emptyMessage = 'لا توجد بيانات',
}: TableProps<T>) {
    const { locale } = useLocale();

    // Get cell value safely
    const getCellValue = (row: T, column: TableColumn<T>) => {
        const value = row[column.key as keyof T];

        // If custom render function exists, use it
        if (column.render) {
            return column.render(value, row, data.indexOf(row));
        }

        // Default: return value as string
        return value as React.ReactNode;
    };

    // Generate pagination numbers
    const getPaginationNumbers = () => {
        if (!pagination) return [];

        const { currentPage, totalPages } = pagination;
        const pages: (number | 'ellipsis')[] = [];

        // Simple pagination: show all pages if <= 5
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Complex pagination with ellipsis
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 'ellipsis', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, 'ellipsis', currentPage, 'ellipsis', totalPages);
            }
        }

        return pages;
    };

    return (
        <div className={`bg-white rounded-lg shadow-lg p-5 ${className}`}>
            {/* Header Section */}
            {(title || headerAction || sorting) && (
                <div className="flex items-center justify-between px-6 pb-6">
                    {/* Title container - takes remaining space to push action to end */}
                    <div className="flex-1">
                        {title && (
                            <h2 className="text-xl-bold text-text">{title}</h2>
                        )}
                    </div>
                    <div className="flex justify-end items-center gap-3">
                        {/* Sorting Button */}
                        {sorting && (
                            <button
                                onClick={sorting.onToggle}
                                className="flex items-center 
text-base-bold gap-3 px-6 py-4 border-2 border-Primary-300 rounded-lg bg-white hover:bg-grey-50 transition-colors"
                            >
                                <Image
                                    src="/shered/table/filter.svg"
                                    alt="filter"
                                    width={18}
                                    height={18}
                                />
                                <span className="text-base-bold text-text">
                                    {sorting.direction === 'desc' ? 'الأحدث' : 'الأقدم'}
                                </span>
                            </button>
                        )}
                        {headerAction}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border-2 border-grey-100 ">
                <table className="w-full">
                    {/* Table Header */}
                    <thead className="bg-[#EFF1F3] border-b-2 border-[#BBC5ce]">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={String(column.key)}
                                    className={`px-2 py-3 text-base-bold text-text whitespace-nowrap
                    ${column.align === 'center' ? 'text-center' : ''}
                    ${column.align === 'end' ? 'text-end' : 'text-start'}
                  `}
                                    style={{ width: column.width }}
                                >
                                    {column.header}
                                </th>
                            ))}
                            {rowActions && (
                                <th className="px-2 py-3 text-base-bold text-text text-start">
                                    {actionsHeader}
                                </th>
                            )}
                        </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (rowActions ? 1 : 0)}
                                    className="px-4 py-8 text-center text-grey-500"
                                >
                                    جاري التحميل...
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (rowActions ? 1 : 0)}
                                    className="px-4 py-8 text-center text-grey-500"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIndex) => (
                                <tr
                                    key={String(row[rowKey])}
                                    onClick={() => onRowClick?.(row)}
                                    className={`
                    border-b border-grey-100 last:border-b-0
                    ${onRowClick ? 'cursor-pointer hover:bg-grey-50 transition-colors' : ''}
                  `}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={String(column.key)}
                                            className={`px-4 py-3 text-sm-regular text-[#292D30]
                        ${column.align === 'center' ? 'text-center' : ''}
                        ${column.align === 'end' ? 'text-end' : 'text-start'}
                      `}
                                        >
                                            {getCellValue(row, column)}
                                        </td>
                                    ))}
                                    {rowActions && (
                                        <td className="px-4 py-3 text-sm-regular">
                                            {rowActions(row, rowIndex)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer Section: Pagination + Custom Footer */}
            {(pagination || footerContent) && (
                <div className="px-6 py-4  ">
                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mb-4">
                            {/* Previous Button */}
                            <button
                                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className="px-3 py-1 text-sm-medium text-grey-600 hover:text-Primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >{getTranslation(locale, 'table.previous')}

                            </button>

                            {/* Page Numbers */}
                            {getPaginationNumbers().map((page, index) => (
                                page === 'ellipsis' ? (
                                    <span key={`ellipsis-${index}`} className="px-2 text-grey-400">...</span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => pagination.onPageChange(page)}
                                        className={`
                      w-8 h-8 rounded-full text-sm-medium transition-colors
                      ${pagination.currentPage === page
                                                ? 'bg-Primary-500 text-white'
                                                : 'text-grey-600 hover:bg-grey-100'
                                            }
                    `}
                                    >
                                        {page}
                                    </button>
                                )
                            ))}

                            {/* Next Button */}
                            <button
                                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="px-3 py-1 text-sm-medium text-grey-600 hover:text-Primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {getTranslation(locale, 'table.next')}
                            </button>
                        </div>
                    )}

                    {/* Custom Footer Content */}
                    {footerContent && (
                        <div className="flex items-center justify-between">
                            {footerContent}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Table;
