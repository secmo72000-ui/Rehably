import React from 'react';
import { cn } from '@/shared/utils/cn';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import type { Role } from '@/domains/roles/roles.types';

interface RolesListProps {
    roles: Role[];
    selectedRoleId: string | null;
    onSelectRole: (id: string) => void;
    locale: Locale;
    pagination?: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
    };
}

export function RolesList({ roles, selectedRoleId, onSelectRole, locale, pagination }: RolesListProps) {
    const t = (key: string) => getTranslation(locale, `roles.${key}`);

    return (
        <div className="rounded-lg border border-[#BBC5CE] bg-white pt-4 flex flex-col gap-4 overflow-hidden h-fit">
            <div className="px-4 pb-4 border-b border-[#BBC5CE]">
                <h2 className="text-lg font-bold text-gray-800">{t('rolesList')}</h2>
            </div>

            <div className="flex flex-col gap-2 px-2">
                {roles.map((role) => {
                    const isSelected = selectedRoleId === role.id;
                    return (
                        <div
                            key={role.id}
                            onClick={() => onSelectRole(role.id)}
                            className={cn(
                                "p-4 cursor-pointer transition-all duration-200 rounded-lg border",
                                isSelected
                                    ? "bg-[#EEF4FF] border-primary-200"
                                    : "bg-white border-transparent hover:bg-gray-50 hover:border-[#BBC5CE]"
                            )}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <span className={cn("font-medium", isSelected ? "text-primary-600" : "text-gray-700")}>
                                    {role.name}
                                </span>
                                <div className="flex items-center gap-2">
                                    <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 12 12"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={cn("transition-transform", isSelected ? "rotate-180" : "")}
                                    >
                                        <path d="M2.25 4.5L6 8.25L9.75 4.5" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-400">{role.userCount || 0}</span>
                                </div>
                            </div>

                            {isSelected && (
                                <div className="mt-3 flex items-start justify-start gap-3">
                                    <div className="w-3 h-3 rounded-full bg-blue-500 mt-1 shrink-0"></div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-sm font-bold text-gray-900">{role.description || ''}</span>
                                    </div>
                                </div>
                            )}

                            {!isSelected && (
                                <div className="mt-2 text-start">
                                    <span className="text-xs text-gray-400">
                                        {`${role.userCount} ${t('userCount')}`}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
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
                            {t('pagination.previous') || 'السابق'}
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
                            {t('pagination.next') || 'التالي'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
