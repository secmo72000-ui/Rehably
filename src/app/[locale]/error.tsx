'use client';

import { useEffect } from 'react';
import { Button } from '@/ui/primitives';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Runtime error:', error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-12">
            {/* Icon / Illustration */}
            <div className="w-64 h-64 mb-8 bg-red-50 rounded-full flex items-center justify-center">
                <svg
                    className="w-32 h-32 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
            </div>

            {/* Text Content */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                عذراً، حدث خطأ غير متوقع
            </h1>
            <p className="text-gray-600 text-lg mb-8 text-center max-w-md">
                نعتذر عن هذا الخطأ. يمكنك المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Button
                    variant="outline"
                    onClick={() => window.location.href = '/'}
                    className="min-w-[140px]"
                >
                    الرئيسية
                </Button>
                <Button
                    variant="primary"
                    onClick={reset}
                    className="min-w-[140px]"
                >
                    المحاولة مرة أخرى
                </Button>
            </div>
        </div>
    );
}
