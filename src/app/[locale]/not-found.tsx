'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/ui/primitives';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-12">
            {/* Icon / Illustration */}
            <div className="w-64 h-64 mb-8 bg-gray-50 rounded-full flex items-center justify-center">
                <svg
                    className="w-32 h-32 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            </div>

            {/* Text Content */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                عذراً، هذه الصفحة غير موجودة
            </h1>
            <p className="text-gray-600 text-lg mb-8 text-center max-w-md">
                يبدو أن الصفحة التي تحاول الوصول إليها   غير موجودة.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="min-w-[140px]"
                >
                    العودة للسابق
                </Button>
                <Button
                    variant="primary"
                    onClick={() => router.push('/')}
                    className="min-w-[140px]"
                >
                    الرئيسية
                </Button>
            </div>
        </div>
    );
}
