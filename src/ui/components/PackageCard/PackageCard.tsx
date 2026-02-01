"use client";

import Image from "next/image";
import { cn } from "@/shared/utils/cn";

export interface PackageFeature {
    text: string;
    icon?: string;
}

export interface PackageCardProps {
    /** Package ID */
    id: string;
    /** Badge label (مبتدئ، مقدم، خبير) */
    badge: string;
    /** Badge color variant */
    badgeColor?: "blue" | "green" | "gray";
    /** Price in EGP */
    price: number;
    /** Package description */
    description: string;
    /** List of features */
    features: PackageFeature[];
    /** Is this package featured/highlighted */
    isFeatured?: boolean;
    /** Edit handler */
    onEdit: () => void;
    /** Delete handler */
    onDelete: () => void;
    /** Additional className */
    className?: string;
}

const badgeColors = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    gray: "bg-gray-50 text-gray-600 border-gray-200",
};

export function PackageCard({
    id,
    badge,
    badgeColor = "gray",
    price,
    description,
    features,
    isFeatured = false,
    onEdit,
    onDelete,
    className,
}: PackageCardProps) {
    return (
        <div
            className={cn(
                "relative bg-white rounded-3xl p-6 transition-all duration-200",
                "border-2",
                isFeatured
                    ? "border-Primary-500 shadow-lg"
                    : "border-gray-200 hover:border-Primary-300 hover:shadow-md",
                className
            )}
        >
            {/* Badge - Centered with Icon */}
            <div className="flex justify-center items-center gap-4 mb-4">
                <Image
                    src="/Admin/package/header.png"
                    alt="Package icon"
                    width={40}
                    height={24}
                />
                <span className="text-base font-semibold text-Primary-500">
                    {badge}
                </span>
            </div>

            {/* Price */}
            <div className="text-center mb-2">
                <h3 className="text-4xl font-bold text-gray-900">
                    {price.toLocaleString()} <span className="text-lg">جنيها</span>
                </h3>
            </div>

            {/* Description */}
            <p className="text-center text-sm text-gray-600 mb-6 leading-relaxed">
                {description}
            </p>

            {/* Features Title */}
            <h4 className="text-sm font-semibold text-gray-900 mb-3 text-right">
                المميزات
            </h4>

            {/* Features List */}
            <ul className="space-y-2.5 mb-6">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-right">
                        <Image
                            src={feature.icon || "/Admin/package/task-square.svg"}
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
                    className={cn(
                        "flex-1 py-3 rounded-lg font-medium text-sm transition-colors",
                        isFeatured
                            ? "bg-Primary-500 text-white hover:bg-Primary-600"
                            : "border-2 border-Primary-500 text-Primary-600 hover:bg-Primary-50"
                    )}
                >
                    تعديل الخطة
                </button>
                    {/* Delete Button */}
                <button
                    onClick={onDelete}
                    className="p-3 hover:bg-red-50 rounded-lg transition-colors group border border-gray-300"
                    aria-label="Delete package"
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
