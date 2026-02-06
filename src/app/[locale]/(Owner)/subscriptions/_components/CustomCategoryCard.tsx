'use client';

import Image from 'next/image';
import { cn } from '@/shared/utils/cn';

export interface CustomCategoryFeature {
    text: string;
    icon?: string;
}

export interface CustomCategoryCardProps {
    /** Category ID */
    id: string;
    /** Package name (title) */
    name: string;
    /** Clinic name (subtitle) */
    clinicName: string;
    /** Clinic email */
    email: string;
    /** Price in EGP */
    price: number;
    /** List of features */
    features: CustomCategoryFeature[];
    /** Package status: 1=Active, 2=Draft, 3=Archived */
    status?: number;
    /** Edit handler */
    onEdit: () => void;
    /** Delete/Archive handler */
    onDelete: () => void;
    /** Activate handler (for archived packages) */
    onActivate?: () => void;
    /** Additional className */
    className?: string;
}

export function CustomCategoryCard({
    id,
    name,
    clinicName,
    email,
    price,
    features,
    status = 1,
    onEdit,
    onDelete,
    onActivate,
    className,
}: CustomCategoryCardProps) {
    const isArchived = status === 3;
    const isDraft = status === 2;

    return (
        <div
            className={cn(
                'relative bg-white rounded-3xl p-8 transition-all duration-200',
                'border-2 border-gray-200 hover:border-Primary-300 hover:shadow-md',
                isArchived && 'opacity-60 bg-gray-50',
                className
            )}
        >
            {/* Status Badge */}
            {(isArchived || isDraft) && (
                <div className={cn(
                    'absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium',
                    isArchived && 'bg-red-100 text-red-600',
                    isDraft && 'bg-yellow-100 text-yellow-600'
                )}>
                    {isArchived ? 'مؤرشف' : 'مسودة'}
                </div>
            )}

            {/* Header: Package Name (Title), Clinic Info, and Price */}
            <div className="flex items-start justify-between mb-6 gap-4">
                {/* Package Name, Clinic Info */}
                <div className="flex flex-col items-end">
                    {/* Package name (main title) */}
                    <span className="text-lg font-bold text-text">
                        {name}
                    </span>
                    {/* Clinic name and email (subtitle) */}
                    <span className="text-sm text-gray-500">
                        {clinicName}
                    </span>
                    <span className="text-xs text-gray-400">
                        {email}
                    </span>
                </div>

                {/* Price */}
                <div className="text-left text-3xl-bold text-Primary-500">
                    <h3 className="">
                        {price.toLocaleString()}
                        <span className=""> جنيها</span>
                    </h3>
                </div>
            </div>

            {/* Features Title */}
            <h4 className="text-sm font-semibold text-gray-900 mb-3 text-right">
                المميزات
            </h4>

            {/* Features List */}
            <ul className="space-y-2.5 mb-6">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-right">
                        <Image
                            src={feature.icon || '/Admin/package/task-square.svg'}
                            alt="Feature"
                            width={20}
                            height={20}
                            className="flex-shrink-0 mt-0.5"
                        />
                        <span className="text-sm text-gray-700 flex-1">{feature.text}</span>
                    </li>
                ))}
            </ul>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
                {/* Edit Button */}
                <button
                    onClick={onEdit}
                    className="flex-1 py-3 rounded-lg font-medium text-sm transition-colors border-2 border-Primary-500 text-Primary-600 hover:bg-Primary-50"
                >
                    تعديل الخطة
                </button>

                {/* Archive/Activate Button */}
                {isArchived && onActivate ? (
                    <button
                        onClick={onActivate}
                        className="p-3 hover:bg-green-50 rounded-lg transition-colors group border border-green-500"
                        aria-label="Activate package"
                        title="تفعيل الباقة"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-green-600"
                        >
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </button>
                ) : (
                    <button
                        onClick={onDelete}
                        className="p-3 hover:bg-red-50 rounded-lg transition-colors group border border-gray-300"
                        aria-label="Archive package"
                        title="أرشفة الباقة"
                    >
                        <Image
                            src="/shered/trash.svg"
                            alt="Archive"
                            width={20}
                            height={20}
                            className="opacity-60 group-hover:opacity-100"
                        />
                    </button>
                )}
            </div>
        </div>
    );
}
