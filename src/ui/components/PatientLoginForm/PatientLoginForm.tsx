"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTranslation } from "@/shared/i18n";
import type { Locale } from "@/configs/i18n.config";
import { Input, Button } from "@/ui/primitives";
import { useAuthStore } from "@/domains/auth/auth.store";

interface PatientLoginFormProps {
  locale: Locale;
}

export function PatientLoginForm({ locale }: PatientLoginFormProps) {
  const router = useRouter();
  const {
    sendOtp,
    verifyOtp,
    resetOtpState,
    getRedirectPath,
    otpSent,
    otpPhone,
    isLoading,
    error: storeError
  } = useAuthStore();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [localError, setLocalError] = useState<string | null>(null);

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const t = (key: string) => getTranslation(locale, key);
  const isRtl = locale === 'ar';
  const error = localError || storeError;

  // Reset OTP state when component unmounts
  useEffect(() => {
    return () => {
      resetOtpState();
    };
  }, [resetOtpState]);

  // Focus first OTP input when OTP is sent
  useEffect(() => {
    if (otpSent && otpRefs[0].current) {
      otpRefs[0].current.focus();
    }
  }, [otpSent]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validate phone number (Egyptian format)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 11 || !cleanPhone.startsWith('01')) {
      setLocalError('يرجى إدخال رقم هاتف صحيح (11 رقم يبدأ بـ 01)');
      return;
    }

    try {
      await sendOtp(cleanPhone);
    } catch {
      // Error is handled by store
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace - move to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);

    // Focus appropriate input after paste
    const focusIndex = Math.min(pastedData.length, 3);
    otpRefs[focusIndex].current?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const otpCode = otp.join('');
    if (otpCode.length !== 4) {
      setLocalError('يرجى إدخال رمز التحقق كاملاً');
      return;
    }

    try {
      await verifyOtp(otpPhone!, otpCode);
      const path = getRedirectPath();
      router.push(`/${locale}${path}`);
    } catch {
      // Error is handled by store
    }
  };

  const handleResendOtp = async () => {
    setLocalError(null);
    setOtp(["", "", "", ""]);
    try {
      await sendOtp(otpPhone!);
    } catch {
      // Error is handled by store
    }
  };

  const handleChangePhone = () => {
    resetOtpState();
    setOtp(["", "", "", ""]);
    setLocalError(null);
  };

  return (
    <div className="w-full max-w-[320px] sm:max-w-[400px] md:max-w-[450px] lg:max-w-[500px] mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8 gap-2 md:gap-4 flex flex-col items-center">
        <h1 className="text-5xl-bold text-text">
          {otpSent ? 'تأكيد رقم الهاتف' : 'مرحباً بك'}
        </h1>
        <p className="text-2xl-regular text-gray-500">
          {otpSent
            ? `تم إرسال رمز التحقق إلى ${otpPhone}`
            : 'أدخل رقم هاتفك للمتابعة'
          }
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
          {error}
        </div>
      )}

      {/* Step 1: Phone Input */}
      {!otpSent ? (
        <form onSubmit={handleSendOtp} className="space-y-4 md:space-y-5 w-full">
          <Input
            type="tel"
            value={phone}
            onChange={setPhone}
            placeholder="01xxxxxxxxx"
            isRtl={isRtl}
            autoComplete="tel"
            disabled={isLoading}
            icon={
              <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading || !phone}
          >
            إرسال رمز التحقق
          </Button>
        </form>
      ) : (
        /* Step 2: OTP Input */
        <form onSubmit={handleVerifyOtp} className="space-y-4 md:space-y-5 w-full">
          {/* OTP Inputs */}
          <div
            className={`flex gap-3 justify-center ${isRtl ? 'flex-row-reverse' : ''}`}
            onPaste={handleOtpPaste}
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={otpRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                disabled={isLoading}
                className="w-14 h-14 md:w-16 md:h-16 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-Primary-500 focus:ring-2 focus:ring-Primary-100 outline-none transition-all disabled:opacity-50"
              />
            ))}
          </div>

          {/* Resend & Change Phone */}
          <div className="flex flex-col gap-2 text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isLoading}
              className="text-sm text-Primary-500 hover:text-Primary-600 disabled:opacity-50"
            >
              إعادة إرسال الرمز
            </button>
            <button
              type="button"
              onClick={handleChangePhone}
              disabled={isLoading}
              className="text-sm text-gray-500 hover:text-gray-600 disabled:opacity-50"
            >
              تغيير رقم الهاتف
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading || otp.some(d => !d)}
          >
            تأكيد
          </Button>
        </form>
      )}
    </div>
  );
}
