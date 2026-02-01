'use client';

import React from 'react';
import Image from 'next/image';

// ========== Types ==========
export interface FeatureCardProps {
    id: string;
    price: number;
    description: string;
    isHighPrice?: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

// ========== Component ==========
export function FeatureCard({
    price,
    description,
    isHighPrice = false,
    onEdit,
    onDelete,
}: FeatureCardProps) {
    return (
        <div
            className={`
                relative rounded-xl p-6 border-2 border-Primary-100
                shadow-feature transition-all duration-200 hover:shadow-lg
                ${isHighPrice ? 'bg-mint-50' : 'bg-white'}
            `}
        >
            {/* Action Buttons */}
            <div className="absolute top-4 left-4 flex gap-2">
                {/* Edit Button */}
                <button
                    onClick={onEdit}
                    className=" flex items-center justify-center  hover:bg-grey-50  transition-colors"
                    aria-label="تعديل"
                >
                    <Image
                        src="/shered/edit.svg"
                        alt="تعديل"
                        width={24}
                        height={24}
                        className="opacity-70"
                    />
                </button>

                {/* Delete Button */}
                <button
                    onClick={onDelete}
                    className=" flex items-center justify-center  hover:bg-error-50  transition-colors"
                    aria-label="حذف"
                >
                    <Image
                        src="/shered/trash.svg"
                        alt="حذف"
                        width={24}
                        height={24}
                        className="opacity-70"
                    />
                </button>
            </div>

            {/* Content */}
            <div className="flex flex-col items-center justify-center text-center pt-8 space-y-3">
                {/* Price */}
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl-bold text-text">
                        {price}
                    </span>
                    <span className="text-2xl-bold text-text">
                        جنيها
                    </span>
                </div>

                {/* Description */}
                <p className="text-sm-regular text-subtitle">
                    {description}
                </p>
            </div>
        </div>
    );
}
