import Image from "next/image";
import Link from "next/link";
import { getTranslation } from "@/shared/i18n";
import type { Locale } from "@/configs/i18n.config";
import { ForgotPasswordForm } from "@/ui/components";

interface PageProps {
    params: Promise<{ locale: string }>;
}

export default async function ForgotPasswordPage({ params }: PageProps) {
    const { locale } = await params;
    const t = (key: string) => getTranslation(locale as Locale, key);

    return (
        <div className="w-full bg-[#8c8c8c] min-h-screen flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 overflow-auto">
            <div className="w-full max-w-[1200px] bg-white flex flex-col min-h-[600px] md:min-h-[700px] rounded-sm shadow-2xl relative">

                {/* Header */}
                <div className="w-full flex items-center justify-between p-6 md:p-8">
                    <Link href={`/${locale}/login`}>
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded text-gray-700 hover:bg-gray-50 transition-colors">
                            <span>{t('auth.forgotPassword.backToLogin')}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </Link>

                    <div className="flex items-center">
                        {/* Logo placeholder - assuming small logo might not be just login-logo.svg. Let's use text with primary color */}
                        <h1 className="text-2xl font-bold text-Primary-500 flex items-center gap-2">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v2h2v5h2v-5h2v-2z" />
                            </svg>
                            <span>Rehably</span>
                        </h1>
                    </div>
                </div>

                {/* Form Container */}
                <div className="flex-1 flex items-center justify-center p-6 md:p-12">
                    <ForgotPasswordForm locale={locale as Locale} />
                </div>
            </div>
        </div>
    );
}
