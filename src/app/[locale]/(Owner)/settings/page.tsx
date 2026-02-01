'use client';

import React, { useState } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { getTranslation } from '@/shared/i18n';
import type { Locale } from '@/configs/i18n.config';
import Image from 'next/image';

export default function SettingsPage() {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const locale = params.locale as Locale;
    const t = (key: string) => getTranslation(locale, `settings.${key}`);

    const [isBackupEnabled, setIsBackupEnabled] = useState(true);

    const changeLanguage = () => {
        const newLocale = locale === 'ar' ? 'en' : 'ar';
        const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
        router.push(newPath);
    };

    return (
       
            

            <div className="bg-white rounded-lg shadow-lg p-5 space-y-4 min-h-screen ">
                {/* Title */}
            <div className="flex items-center justify-start pb-4">
                <h1 className="text-xl font-bold text-gray-900">{t('pageTitle')}</h1>
            </div>

                {/* Language Selection */}
                <div className="border border-grey-200 rounded-lg p-6">
                    <p className="text-base text-gray-500 mb-3 text-start">{t('language')}</p>
                    <div className="flex justify-start"> 
                           <button
                            className="flex items-center gap-2 px-4 py-4 rounded-lg border border-primary-500 hover:bg-gray-50 text-[#4A4A4A] text-base-bold "
                            onClick={changeLanguage}
                        >
                            <Image src="/shered/world.svg" alt="lang" width={20} height={20} />
                            <span>{locale === 'ar' ? 'اللغة العربية' : 'English'}</span>
                        </button>
                    </div>
                </div>

                {/* Data Backup */}
                <div className="border border-grey-200 rounded-lg p-6 flex items-center justify-between">
                        <span className="text-base font-medium text-gray-700">{t('dataBackup')}</span>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsBackupEnabled(!isBackupEnabled)}
                            className={`flex items-center gap-2 px-4 py-4 rounded-lg border transition-colors ${isBackupEnabled
                                    ? 'border-primary-200 bg-primary-50 text-primary-600'
                                    : 'border-gray-200 text-gray-500'
                                }`}
                        >
                            <span>{t('enabled')}</span>
                            <div className={`w-10 h-6 rounded-full relative transition-colors ${isBackupEnabled ? 'bg-Primary-500' : 'bg-gray-300'}`}>
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isBackupEnabled ? 'left-1' : 'left-[calc(100%-1.25rem)]'}`} />
                              
                            </div>
                        </button>
                    </div>
                </div>

                {/* Roles and Permissions */}
                <button
                    onClick={() => router.push(`settings/roles`)}
                    className="w-full border border-grey-200 rounded-lg p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <span className="text-base font-medium text-gray-700">{t('rolesAndPermissions')}</span>
                    <Image src="/shered/arrwo.svg" alt="arrow" width={10} height={10} className="opacity-50" />
                </button>

            </div>
      
    );
}
