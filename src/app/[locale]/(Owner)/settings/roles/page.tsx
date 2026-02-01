'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';

export default function RolesPage() {
    const params = useParams();
    const router = useRouter();
    const locale = params.locale as Locale;
    const t = (key: string) => getTranslation(locale, `settings.${key}`);

    return (
        <div className="space-y-6 bg-white rounded-lg shadow-lg p-5">
            {/* Title */}
            <div className="flex items-center justify-start pb-4 text-xl font-bold">
                <span
                    className="text-text cursor-pointer hover:text-Primary-500 transition-colors"
                    onClick={() => router.back()}
                >
                    {t('pageTitle')}
                </span>
                <span className="mx-2 text-text text-3xl">{'>'}</span>
                <span className="text-text">{t('rolesAndPermissions')}</span>
            </div>

        </div>
    );
}
