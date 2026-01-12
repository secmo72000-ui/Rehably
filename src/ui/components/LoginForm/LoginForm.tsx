"use client";

import { useState } from "react";
import Link from "next/link";
import { getTranslation } from "@/shared/i18n";
import type { Locale } from "@/configs/i18n.config";
import { Input, Button, Checkbox } from "@/ui/primitives";
import { EmailIcon, LockIcon, EyeIcon, EyeOffIcon } from "@/ui/icons";

interface LoginFormProps {
  locale: Locale;
}

export function LoginForm({ locale }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const t = (key: string) => getTranslation(locale, key);
  const isRtl = locale === 'ar';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log({ email, password, rememberMe });
  };

  return (
    <div className="w-full max-w-[320px] sm:max-w-[400px] md:max-w-[450px] lg:max-w-[500px] mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8 gap-2 md:gap-4 flex flex-col items-center">
        <h1 className="text-5xl-bold text-text">{t('login.welcomeTitle')}</h1>
        <p className="text-2xl-regular text-gray-500">{t('login.welcomeSubtitle')}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 w-full">
        {/* Email Field */}
        <Input
          type="email"
          value={email}
          onChange={setEmail}
          placeholder={t('login.emailPlaceholder')}
          icon={<EmailIcon className="h-4 w-4 md:h-5 md:w-5" />}
          isRtl={isRtl}
          autoComplete="email"
        />

        {/* Password Field */}
        <Input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder={t('login.passwordPlaceholder')}
          icon={<LockIcon className="h-4 w-4 md:h-5 md:w-5" />}
          isRtl={isRtl}
          autoComplete="current-password"
          endIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4 md:h-5 md:w-5" />
              ) : (
                <EyeIcon className="h-4 w-4 md:h-5 md:w-5" />
              )}
            </button>
          }
        />

        {/* Remember Me & Forgot Password */}
        <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
          <Checkbox
            checked={rememberMe}
            onChange={setRememberMe}
            label={t('login.rememberMe')}
            isRtl={isRtl}
          />
          <Link
            href={`/${locale}/forgot-password`}
            className="text-xs md:text-sm text-gray-500 hover:text-Primary-500 transition-colors"
          >
            {t('login.forgotPassword')}
          </Link>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
        >
          {t('login.loginButton')}
        </Button>
      </form>
    </div>
  );
}

