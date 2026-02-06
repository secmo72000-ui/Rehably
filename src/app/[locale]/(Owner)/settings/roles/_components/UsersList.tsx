import React from 'react';
import Image from 'next/image';
import { DataRow, DataCell } from '@/ui/components/DataCell';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import type { PlatformUser } from '@/domains/users/users.types';

interface UsersListProps {
    users: PlatformUser[];
    locale: Locale;
    onDeleteUser: (id: string) => void;
    onViewUser: (id: string) => void;
}

export function UsersList({ users = [], locale, onDeleteUser, onViewUser }: UsersListProps) {
    const t = (key: string) => getTranslation(locale, `roles.${key}`);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="w-full">
                <DataRow
                    className="rounded-lg py-2 px-6 border border-[#BBC5CE] bg-[#E8FBF9]"
                    gap="gap-4"
                    cells={[
                        { variant: 'text', value: t('form.name') || 'الاسم', className: 'items-center justify-center font-bold text-[#1D2939]' },
                        { variant: 'text', value: t('form.email') || 'البريد الالكتروني', className: 'items-center justify-center font-bold text-[#1D2939]' },
                        { variant: 'text', value: t('form.phone') || 'رقم التليفون', className: 'items-center justify-center font-bold text-[#1D2939]' },
                        { variant: 'text', value: t('form.role') || 'الدور', className: 'items-center justify-center font-bold text-[#1D2939]' },
                        { variant: 'text', value: t('form.details') || 'تفاصيل', className: 'items-center justify-center font-bold text-[#1D2939]' },
                    ]}
                    columns={5}
                />
            </div>

            {/* List */}
            <div className="space-y-3">
                {users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 border rounded-lg">
                        {t('noUsers') || 'لا يوجد مستخدمين'}
                    </div>
                ) : (
                    users.map((user) => (
                        <div key={user.id} className="w-full">
                            <DataRow
                                className="bg-white border border-[#BBC5CE] rounded-lg p-4 h-full"
                                columns={5}
                                gap="gap-4"
                                cells={[
                                    {
                                        variant: 'text',
                                        value: `${user.firstName} ${user.lastName}`,
                                        className: 'items-center justify-center font-medium text-[#101828]'
                                    },
                                    {
                                        variant: 'text',
                                        value: user.email,
                                        className: 'items-center justify-center text-[#101828]'
                                    },
                                    {
                                        variant: 'text',
                                        value: user.phoneNumber || '01000000000', // Placeholder as per design request/API limitation
                                        className: 'items-center justify-center text-[#101828]'
                                    },
                                    {
                                        variant: 'text',
                                        value: user.role.name,
                                        className: 'items-center justify-center text-[#101828] font-bold'
                                    },
                                    {
                                        variant: 'custom',
                                        content: (
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => onViewUser(user.id)}
                                                    className="hover:opacity-80 transition-opacity"
                                                >
                                                    <Image
                                                        src="/shered/table/eye.svg"
                                                        alt="view"
                                                        width={20}
                                                        height={20}
                                                    />
                                                </button>
                                                <button
                                                    onClick={() => onDeleteUser(user.id)}
                                                    className="hover:opacity-80 transition-opacity"
                                                >
                                                    <Image
                                                        src="/shered/trash.svg"
                                                        alt="delete"
                                                        width={20}
                                                        height={20}
                                                    />
                                                </button>
                                            </div>
                                        ),
                                        className: 'items-center justify-center'
                                    },
                                ]}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
