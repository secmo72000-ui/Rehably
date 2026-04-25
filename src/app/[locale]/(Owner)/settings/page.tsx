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
                    <div className="flex justify-start gap-4"> 
                        <button
                            className={`flex items-center gap-2 px-8 py-3 rounded-lg border text-base-bold transition-colors ${
                                locale === 'ar'
                                    ? 'border-Primary-500 bg-Primary-50 text-Primary-600'
                                    : 'border-grey-200 text-gray-500 hover:bg-gray-50'
                            }`}
                            onClick={() => locale !== 'ar' && changeLanguage()}
                        >
                            <Image src="/shered/world.svg" alt="lang" width={20} height={20} className={locale !== 'ar' ? 'opacity-50 grayscale' : ''} />
                            <span>اللغة العربية</span>
                        </button>
                        <button
                            className={`flex items-center gap-2 px-8 py-3 rounded-lg border text-base-bold transition-colors ${
                                locale === 'en'
                                    ? 'border-Primary-500 bg-Primary-50 text-Primary-600'
                                    : 'border-grey-200 text-gray-500 hover:bg-gray-50'
                            }`}
                            onClick={() => locale !== 'en' && changeLanguage()}
                        >
                            <Image src="/shered/world.svg" alt="lang" width={20} height={20} className={locale !== 'en' ? 'opacity-50 grayscale' : ''} />
                            <span>English</span>
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

                {/* Specialities */}
                <button
                    onClick={() => router.push(`settings/specialities`)}
                    className="w-full border border-grey-200 rounded-lg p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-xl">🏥</span>
                        <div className="text-start">
                            <p className="text-base font-medium text-gray-700">التخصصات الطبية</p>
                            <p className="text-xs text-gray-400 mt-0.5">إدارة التخصصات وتعيينها للعيادات</p>
                        </div>
                    </div>
                    <Image src="/shered/arrwo.svg" alt="arrow" width={10} height={10} className="opacity-50" />
                </button>

                {/* Diagnoses */}
                <button
                    onClick={() => router.push(`settings/diagnoses`)}
                    className="w-full border border-grey-200 rounded-lg p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-xl">🩺</span>
                        <div className="text-start">
                            <p className="text-base font-medium text-gray-700">قائمة التشخيصات ICD-10</p>
                            <p className="text-xs text-gray-400 mt-0.5">التشخيصات العالمية المنسقة لكل تخصص</p>
                        </div>
                    </div>
                    <Image src="/shered/arrwo.svg" alt="arrow" width={10} height={10} className="opacity-50" />
                </button>

            </div>
      
    );
}
