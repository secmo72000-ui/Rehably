'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const clinicId = searchParams.get('clinicId');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center space-y-4">
                <div className="flex justify-center">
                    <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-semibold text-gray-800">Payment Successful</h1>
                <p className="text-gray-500">
                    Your payment has been processed. The clinic is being activated — you will receive a welcome email shortly.
                </p>
                {clinicId && (
                    <p className="text-xs text-gray-400">Clinic ID: {clinicId}</p>
                )}
                <a
                    href="/en/clinic-management"
                    className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Go to Clinic Management
                </a>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense>
            <PaymentSuccessContent />
        </Suspense>
    );
}
