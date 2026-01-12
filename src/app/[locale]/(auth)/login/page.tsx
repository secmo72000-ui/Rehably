import Image from "next/image";
import { getTranslation } from "@/shared/i18n";
import type { Locale } from "@/configs/i18n.config";
import { LoginForm } from "@/ui/components";

interface LoginPageProps {
  params: Promise<{ locale: string }>;
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  const t = (key: string) => getTranslation(locale as Locale, key);

  return (
    <div className="w-full bg-BG h-screen flex flex-col lg:flex-row items-center justify-center gap-4 md:gap-8 lg:gap-16 py-6 md:py-12 lg:py-20 px-4 md:px-8 lg:px-16 overflow-auto">
      {/* Left Section - Above login on mobile, beside on desktop */}
      <div className="w-full lg:w-[35%] flex flex-col items-center justify-center">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[48px] font-bold leading-tight md:leading-snug lg:leading-relaxed xl:leading-20 text-center px-4 md:px-8 lg:px-12 xl:px-16 text-text">
          {t('login.pageTitle')}
        </h1>
        <Image
          src="/Admin/login-logo.svg"
          alt="Rehably Logo"
          width={408}
          height={408}
          className="w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 xl:w-[408px] xl:h-[408px]"
        />
      </div>

      {/* Right Section - Login Form (65% of parent on lg screens, fixed size on xl) */}
      <div className="w-full max-w-[95%] sm:max-w-[85%] md:max-w-[75%] lg:w-[65%] xl:w-[912px] h-auto min-h-[450px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[700px] xl:h-[960px] flex items-center justify-center bg-white rounded-2xl md:rounded-3xl lg:rounded-[40px] shadow-card p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
        <LoginForm locale={locale as Locale} />
      </div>
    </div>
  );
}
