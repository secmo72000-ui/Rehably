"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getTranslation } from "@/shared/i18n";
import type { Locale } from "@/configs/i18n.config";
import { Button } from "@/ui/primitives";
import { authService } from "@/domains/auth/auth.service";

interface VerifyOtpFormProps {
    locale: Locale;
}

function VerifyOtpFormContent({ locale }: VerifyOtpFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    const [otp, setOtp] = useState(["", "", "", ""]);
    const [timeLeft, setTimeLeft] = useState(59);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const otpRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];

    const t = (key: string) => getTranslation(locale, key);
    const isRtl = locale === 'ar';

    useEffect(() => {
        if (!email) {
            router.push(`/${locale}/login`);
        } else {
            otpRefs[0].current?.focus();
        }
    }, [email, locale, router]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft]);

    const handleOtpChange = (index: number, value: string) => {
        if (value && !/^[A-Za-z0-9]$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 3) {
            otpRefs[index + 1].current?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs[index - 1].current?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/[^A-Za-z0-9]/g, '').slice(0, 4);
        const newOtp = [...otp];

        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);

        const focusIndex = Math.min(pastedData.length, 3);
        if (focusIndex < 4) {
            otpRefs[focusIndex].current?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpCode = otp.join('');

        if (otpCode.length !== 4) {
            setError("يرجى إدخال رمز التحقق كاملاً");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const resp = await authService.verifyPasswordResetOtp(email, otpCode);
            const token = (resp as any).data?.token || (resp as any).token || otpCode;
            sessionStorage.setItem('reset_token', token);
            router.push(`/${locale}/reset-password?email=${encodeURIComponent(email)}`);
        } catch (err) {
            console.error("Failed to verify OTP", err);
            setError("الرمز غير صحيح أو منتهي الصلاحية.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await authService.forgotPassword(email);
            setTimeLeft(59);
            setOtp(["", "", "", ""]);
            otpRefs[0].current?.focus();
        } catch (err: any) {
            setError("فشل إعادة إرسال الرمز.");
        } finally {
            setIsLoading(false);
        }
    };

    const formattedTime = `00:${timeLeft.toString().padStart(2, '0')}`;

    return (
        <div className="w-full max-w-[320px] sm:max-w-[400px] md:max-w-[450px] lg:max-w-[500px] mx-auto text-center flex flex-col items-center">
            <div className="mb-6 md:mb-8 flex flex-col items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">
                    {t('auth.verifyOtp.title')}
                </h1>
                <p className="text-gray-500 text-sm md:text-base px-4">
                    {t('auth.verifyOtp.subtitle')}
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm w-full">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 w-full">
                <div
                    className={`flex gap-3 justify-center ${isRtl ? 'flex-row-reverse' : ''}`}
                    onPaste={handleOtpPaste}
                >
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={otpRefs[index]}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            disabled={isLoading}
                            className="w-12 h-12 md:w-16 md:h-16 text-center text-xl md:text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-Primary-500 focus:ring-2 focus:ring-Primary-100 outline-none transition-all disabled:opacity-50"
                        />
                    ))}
                </div>

                <div className="flex items-center justify-between px-2 text-sm">
                    {timeLeft > 0 ? (
                        <span className="text-red-500">{t('auth.verifyOtp.expired')} {formattedTime}</span>
                    ) : (
                        <span className="text-gray-400">00:00</span>
                    )}

                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={timeLeft > 0 || isLoading}
                        className="text-gray-500 hover:text-Primary-500 disabled:opacity-50 transition-colors"
                    >
                        {t('auth.verifyOtp.resendCode')}
                    </button>
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={isLoading || otp.some(d => !d)}
                >
                    {t('auth.verifyOtp.submit')}
                </Button>
            </form>
        </div>
    );
}

export function VerifyOtpForm({ locale }: VerifyOtpFormProps) {
    return (
        <Suspense fallback={<div className="p-8 text-center">{getTranslation(locale, 'table.loading')}</div>}>
            <VerifyOtpFormContent locale={locale} />
        </Suspense>
    );
}
