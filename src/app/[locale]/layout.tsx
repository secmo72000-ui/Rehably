import { notFound } from "next/navigation";
import { i18nConfig, getDirection, type Locale } from "@/configs/i18n.config";
import { cairo } from "../layout";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale
  if (!i18nConfig.locales.includes(locale as Locale)) {
    notFound();
  }

  const direction = getDirection(locale as Locale);

  return (
    <html lang={locale} dir={direction}>
      <body className={`${cairo.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

