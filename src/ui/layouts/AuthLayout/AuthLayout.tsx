import React, { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

export interface AuthLayoutProps {
    locale: string;
    backButtonText: string;
    children: ReactNode;
}

export function AuthLayout({ locale, backButtonText, children }: AuthLayoutProps) {
    return (
        <div className="w-full h-screen bg-white flex flex-col">
            {/* Header */}
            <div className="w-[80%] mx-auto flex items-center justify-between p-6 md:py-[40px]">
                <div className="flex items-center">
                    <Image src="/shered/logo.png" alt="Logo" width={200} height={100} />
                </div>
                <Link href={`/${locale}/login`}>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded text-gray-700 hover:bg-gray-50 transition-colors">
                        <span>{backButtonText}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </Link>
            </div>

            {/* Form Container */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12">
                {children}
            </div>
        </div>
    );
}
