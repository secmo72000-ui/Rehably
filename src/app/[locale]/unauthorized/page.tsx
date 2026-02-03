import Link from "next/link";
import { getTranslation } from "@/shared/i18n";
import type { Locale } from "@/configs/i18n.config";

interface UnauthorizedPageProps {
  params: Promise<{ locale: string }>;
}

export default async function UnauthorizedPage({ params }: UnauthorizedPageProps) {
  const { locale } = await params;
  const t = (key: string) => getTranslation(locale as Locale, key);

  return (
    <div className="min-h-screen bg-BG flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-card p-8 md:p-12 max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <svg 
            className="w-10 h-10 text-red-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          غير مصرح بالدخول
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-8">
          ليس لديك صلاحية الوصول إلى هذه الصفحة. 
          يرجى تسجيل الدخول بحساب يملك الصلاحيات المناسبة.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href={`/${locale}/login`}
            className="w-full py-3 px-6 bg-Primary-500 text-white rounded-xl font-medium hover:bg-Primary-600 transition-colors"
          >
            تسجيل الدخول
          </Link>
          <Link
            href={`/${locale}`}
            className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
