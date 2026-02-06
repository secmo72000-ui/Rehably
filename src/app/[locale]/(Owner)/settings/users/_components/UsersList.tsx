import React from 'react';
import { cn } from '@/shared/utils/cn';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import type { PlatformUser } from '@/domains/users/admin-users.types';
import Image from 'next/image';

interface UsersListProps {
    users: PlatformUser[];
    locale: Locale;
    pagination?: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
    };
    onDelete: (id: string, name: string) => void;
    onView: (user: PlatformUser) => void;
}

export function UsersList({ users, locale, pagination, onDelete, onView }: UsersListProps) {
    const t = (key: string) => getTranslation(locale, `usersPage.${key}`);

    return (
        <div className="rounded-lg border border-[#BBC5CE] bg-white pt-4 flex flex-col gap-4 overflow-hidden h-fit">
            {/* Header row acting as table header */}
            <div className="flex items-center gap-4 px-4 py-2 bg-[#E6F6F4] rounded-lg mx-2 border border-transparent">
                <div className="flex-1 text-center font-medium text-[#006064]">{t('table.name')}</div>
                <div className="flex-1 text-center font-medium text-[#006064]">{t('table.email')}</div>
                <div className="flex-1 text-center font-medium text-[#006064]">{t('table.phone')}</div>
                <div className="flex-1 text-center font-medium text-[#006064]">{t('table.role')}</div>
                <div className="flex-1 text-center font-medium text-[#006064]">{t('table.actions')}</div>
            </div>

            <div className="flex flex-col gap-2 px-2">
                {users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {getTranslation(locale, 'table.noData')}
                    </div>
                ) : (
                    users.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center gap-4 p-4 rounded-lg border border-[#BBC5CE] hover:shadow-sm transition-all duration-200 bg-white"
                        >
                            {/* Name */}
                            <div className="flex-1 text-center font-medium text-gray-800">
                                {`${user.firstName} ${user.lastName}`}
                            </div>

                            {/* Email */}
                            <div className="flex-1 text-center text-sm text-gray-600 truncate" title={user.email}>
                                {user.email}
                            </div>


                            <div className="flex-1 text-center text-sm text-gray-600">
                                01023456789
                            </div>

                            {/* Role */}
                            <div className="flex-1 text-center text-sm font-medium text-gray-700">
                                {user.role?.name || '-'}
                            </div>

                            {/* Actions */}
                            <div className="flex-1 flex justify-center items-center gap-3">
                                <button
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                    onClick={() => onView(user)}
                                    title="View"
                                >
                                    <Image src="/shered/table/eye.svg" alt="View" width={20} height={20} />
                                </button>
                                <button
                                    className="p-1 hover:bg-red-50 rounded-full transition-colors"
                                    onClick={() => onDelete(user.id, `${user.firstName} ${user.lastName}`)}
                                    title="Delete"
                                >
                                    <Image src="/shered/trash.svg" alt="Delete" width={20} height={20} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Footer */}
            {pagination && pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-[#BBC5CE]">
                    <div className="flex items-center justify-center gap-2">
                        {/* Previous Button */}
                        <button
                            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {/* {t('pagination.previous')} */}
                            {getTranslation(locale, 'table.previous')}
                        </button>

                        {/* Page Numbers */}
                        {(() => {
                            const { currentPage, totalPages } = pagination;
                            const pages: (number | 'ellipsis')[] = [];

                            if (totalPages <= 5) {
                                for (let i = 1; i <= totalPages; i++) pages.push(i);
                            } else {
                                if (currentPage <= 3) {
                                    pages.push(1, 2, 3, 'ellipsis', totalPages);
                                } else if (currentPage >= totalPages - 2) {
                                    pages.push(1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages);
                                } else {
                                    pages.push(1, 'ellipsis', currentPage, 'ellipsis', totalPages);
                                }
                            }

                            return pages.map((page, index) => (
                                page === 'ellipsis' ? (
                                    <span key={`ellipsis-${index}`} className="px-2 text-gray-400">...</span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => pagination.onPageChange(page)}
                                        className={cn(
                                            "w-8 h-8 rounded-full text-sm font-medium transition-colors",
                                            pagination.currentPage === page
                                                ? "bg-primary-500 text-white"
                                                : "text-gray-600 hover:bg-gray-100"
                                        )}
                                    >
                                        {page}
                                    </button>
                                )
                            ));
                        })()}

                        {/* Next Button */}
                        <button
                            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {getTranslation(locale, 'table.next')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
