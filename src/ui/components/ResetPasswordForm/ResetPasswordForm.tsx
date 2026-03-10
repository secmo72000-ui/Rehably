"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getTranslation } from "@/shared/i18n";
import type { Locale } from "@/configs/i18n.config";
import { Input, Button } from "@/ui/primitives";
import { LockIcon, EyeIcon, EyeOffIcon } from "@/ui/icons";
import { authService } from "@/domains/auth/auth.service";

interface ResetPasswordFormProps {
    locale: Locale;
}

function ResetPasswordFormContent({ locale }: ResetPasswordFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    const [token, setToken] = useState<string>('');
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const t = (key: string) => getTranslation(locale, key);
    const isRtl = locale === 'ar';

    useEffect(() => {
        const storedToken = sessionStorage.getItem('reset_token');
        if (!email || !storedToken) {
            router.push(`/${locale}/login`);
        } else {
            setToken(storedToken);
        }
    }, [email, locale, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (newPassword !== confirmPassword) {
            setError(t('auth.resetPassword.passwordMismatch'));
            setIsLoading(false);
            return;
        }

        try {
            if (!email || !token) {
                throw new Error("Missing parameters");
            }
            await authService.resetPassword({ token, newPassword });
            sessionStorage.removeItem('reset_token');
            router.push(`/${locale}/login`);
        } catch (err: any) {
            console.error(err);
            setError("فشل إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[320px] sm:max-w-[400px] md:max-w-[450px] lg:max-w-[500px] mx-auto text-center flex flex-col items-center">
            <div className="mb-6 md:mb-8 flex flex-col items-center gap-2">
                <div className="relative mb-2">
                    <div className="w-16 h-16 bg-blue-100 text-Primary-500 rounded flex items-center justify-center">
                        <LockIcon className="w-8 h-8" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        ***
                    </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-text mt-4 mb-2">
                    {t('auth.resetPassword.title')}
                </h1>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm w-full">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 w-full">
                <Input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
                    icon={<LockIcon className="h-4 w-4 md:h-5 md:w-5" />}
                    isRtl={isRtl}
                    autoComplete="new-password"
                    disabled={isLoading}
                    endIcon={
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            disabled={isLoading}
                        >
                            {showPassword ? <EyeOffIcon className="h-4 w-4 md:h-5 md:w-5" /> : <EyeIcon className="h-4 w-4 md:h-5 md:w-5" />}
                        </button>
                    }
                />

                <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
                    icon={<LockIcon className="h-4 w-4 md:h-5 md:w-5" />}
                    isRtl={isRtl}
                    autoComplete="new-password"
                    disabled={isLoading}
                    endIcon={
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            disabled={isLoading}
                        >
                            {showConfirmPassword ? <EyeOffIcon className="h-4 w-4 md:h-5 md:w-5" /> : <EyeIcon className="h-4 w-4 md:h-5 md:w-5" />}
                        </button>
                    }
                />

                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={isLoading}
                >
                    {t('auth.resetPassword.submit')}
                </Button>
            </form>
        </div>
    );
}

export function ResetPasswordForm({ locale }: ResetPasswordFormProps) {
    return (
        <Suspense fallback={<div className="p-8 text-center">{getTranslation(locale, 'table.loading')}</div>}>
            <ResetPasswordFormContent locale={locale} />
        </Suspense>
    );
}
