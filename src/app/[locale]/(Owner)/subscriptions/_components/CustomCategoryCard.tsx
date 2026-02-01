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
    /** User/Clinic name */
    name: string;
    /** User/Clinic email */
    email: string;
    /** Price in EGP */
    price: number;
    /** List of features */
    features: CustomCategoryFeature[];
    /** Edit handler */
    onEdit: () => void;
    /** Delete handler */
    onDelete: () => void;
    /** Additional className */
    className?: string;
}

export function CustomCategoryCard({
    id,
    name,
    email,
    price,
    features,
    onEdit,
    onDelete,
    className,
}: CustomCategoryCardProps) {
    return (
        <div
            className={cn(
                'relative bg-white rounded-3xl p-8 transition-all duration-200',
                'border-2 border-gray-200 hover:border-Primary-300 hover:shadow-md',
                className
            )}
        >
            {/* Header: Name, Email, and Price */}
            <div className="flex items-start justify-between mb-6 gap-4">
                {/* Name and Email (No Avatar) */}
                <div className="flex  flex-col items-end ">
                    <span className="text-base-bold text-text">
                        {name}
                    </span>
                    <span className="text-base-regular text-text ">
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

            {/* Action Buttons - Edit and Delete */}
            <div className="flex items-center gap-3">
                {/* Edit Button */}
                <button
                    onClick={onEdit}
                    className="flex-1 py-3 rounded-lg font-medium text-sm transition-colors border-2 border-Primary-500 text-Primary-600 hover:bg-Primary-50"
                >
                    تعديل الخطة
                </button>

                {/* Delete Button */}
                <button
                    onClick={onDelete}
                    className="p-3 hover:bg-red-50 rounded-lg transition-colors group border border-gray-300"
                    aria-label="Delete category"
                >
                    <Image
                        src="/shered/trash.svg"
                        alt="Delete"
                        width={20}
                        height={20}
                        className="opacity-60 group-hover:opacity-100"
                    />
                </button>
            </div>
        </div>
    );
}
