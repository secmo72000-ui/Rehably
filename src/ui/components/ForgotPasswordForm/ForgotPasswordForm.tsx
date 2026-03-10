"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getTranslation } from "@/shared/i18n";
import type { Locale } from "@/configs/i18n.config";
import { Input, Button } from "@/ui/primitives";
import { EmailIcon } from "@/ui/icons";
import { authService } from "@/domains/auth/auth.service";

interface ForgotPasswordFormProps {
    locale: Locale;
}

export function ForgotPasswordForm({ locale }: ForgotPasswordFormProps) {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const t = (key: string) => getTranslation(locale, key);
    const isRtl = locale === 'ar';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (!email) {
                setError("يرجى إدخال البريد الإلكتروني");
                return;
            }
            await authService.forgotPassword(email);
            router.push(`/${locale}/verify-otp?email=${encodeURIComponent(email)}`);
        } catch (err: any) {
            console.error(err);
            setError("فشل إرسال الرمز. يرجى التحقق من البريد الإلكتروني.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[320px] sm:max-w-[400px] md:max-w-[450px] lg:max-w-[500px] mx-auto text-center flex flex-col items-center">
            <div className="mb-6 md:mb-8 flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-blue-100 text-Primary-500 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">
                    {t('auth.forgotPassword.title')}
                </h1>
                <p className="text-gray-500 text-sm md:text-base px-4">
                    {t('auth.forgotPassword.subtitle')}
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm w-full">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 w-full">
                <Input
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder={t('auth.forgotPassword.emailPlaceholder')}
                    icon={<EmailIcon className="h-4 w-4 md:h-5 md:w-5" />}
                    isRtl={isRtl}
                    autoComplete="email"
                    disabled={isLoading}
                />

                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={isLoading}
                    disabled={isLoading || !email}
                >
                    {t('auth.forgotPassword.submit')}
                </Button>
            </form>
        </div>
    );
}
