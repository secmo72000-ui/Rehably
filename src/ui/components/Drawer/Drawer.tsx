"use client";

import { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

interface DrawerProps {
    children: ReactNode;
    /** Title can be a string or a ReactNode (e.g., logo) */
    title: ReactNode;
    isOpen: boolean;
    onClose: () => void;
    size?: 'sm' | 'md' | 'lg';
}

function Drawer({
    children,
    title,
    isOpen,
    onClose,
    size = 'md',
}: DrawerProps) {
    const sizeClasses = {
        sm: "w-full md:w-[320px]",   // Full width on mobile, 320px on MD+
        md: "w-full md:w-[550px]",   // Full width on mobile, 550px on MD+
        lg: "w-full md:w-[700px]",   // Full width on mobile, 700px on MD+
    };
    return (
        <>
            {isOpen && (
                <div
                    className={cn(
                        "fixed inset-0",
                        "bg-black/50",
                        "z-[100]",
                        "transition-opacity",
                        "duration-300"
                    )}
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <div
                className={cn(
                    "fixed",
                    "top-4 pb-4",

                    isOpen
                        ? "rtl:right-0 md:rtl:right-4 ltr:left-0 md:ltr:left-4"
                        : "rtl:right-0 ltr:left-0", // Off-screen handled by transform below

                    "h-[calc(100vh-2rem)]",
                    // Apply width classes based on size prop
                    sizeClasses[size],

                    "bg-white",
                    "rounded-lg",
                    "shadow-2xl",
                    "z-[110]",

                    "transform",
                    "transition-transform",
                    "duration-300",
                    "ease-in-out",

                    isOpen
                        ? "translate-x-0"
                        : "rtl:translate-x-full ltr:-translate-x-full"
                )}
                role="dialog"
                aria-modal="true"
            >
                <div
                    className={cn(
                        "flex items-center",
                        "justify-between",
                        "p-3",
                    )}
                >
                    {/* Support both string and ReactNode for title */}
                    {typeof title === 'string' ? (
                        <h2 className="text-lg font-semibold text-gray-900">
                            {title}
                        </h2>
                    ) : (
                        <div className="flex-1">{title}</div>
                    )}
                    <button
                        onClick={onClose}
                        className={cn(
                            "p-2",
                            "rounded-full",
                            "hover:bg-gray-100",
                            "transition-colors",
                            "text-gray-500",
                            "hover:text-gray-700"
                        )}
                        aria-label="إغلاق"
                        type="button"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
                {/* Content Container */}
                <div
                    className={cn(
                        "p-5",
                        "overflow-y-auto",
                        "h-[calc(100%-60px)]" // Adjusted height calculation
                    )}
                >
                    {children}
                </div>
            </div>
        </>
    );
}

export default Drawer;
