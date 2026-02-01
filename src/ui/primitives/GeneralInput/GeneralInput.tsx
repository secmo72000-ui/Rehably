"use client";

import { ChevronDownIcon } from "@/ui/icons";
import { cn } from "@/shared/utils/cn";

export interface GeneralInputOption {
    value: string;
    label: string;
}

export interface GeneralInputProps {
    /** Input type - text or select */
    type?: "text" | "select";
    /** Current value */
    value: string;
    /** Change handler */
    onChange: (value: string) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Options for select type */
    options?: GeneralInputOption[];
    /** Error message */
    error?: string;
    /** Input HTML type (for text inputs) */
    htmlType?: "text" | "email" | "tel" | "number" | "password" | "date";
    /** Disabled state */
    disabled?: boolean;
    /** Read-only state - displays value with same UI but not editable */
    readOnly?: boolean;
    /** Additional CSS classes */
    className?: string;
}

export function GeneralInput({
    type = "text",
    value,
    onChange,
    placeholder,
    options = [],
    error,
    htmlType = "text",
    disabled = false,
    readOnly = false,
    className,
}: GeneralInputProps) {
    const baseStyles = cn(
        // Base styles
        "w-full px-4 py-3",
        "text-base text-gray-900 text-right",
        "bg-white border border-gray-300",
        "rounded-lg", // 8px radius
        "transition-all duration-200",
        "placeholder:text-gray-400",

        // Focus states (not for read-only)
        !readOnly && "focus:outline-none focus:ring-2 focus:ring-Primary-500 focus:border-Primary-500",

        // Error state
        error && "border-red-500 focus:ring-red-500 focus:border-red-500",

        // Disabled state
        disabled && "bg-gray-50 cursor-not-allowed opacity-60",

        // Read-only state
        readOnly && "cursor-default bg-gray-50",

        // Additional classes
        className
    );

    if (type === "select") {
        return (
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => !readOnly && onChange(e.target.value)}
                    className={cn(
                        baseStyles,
                        "appearance-none cursor-pointer",
                        "pe-10", // Padding for icon
                        readOnly && "pointer-events-none"
                    )}
                    disabled={disabled || readOnly}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* Chevron Icon */}
                {!readOnly && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                    </div>
                )}
            </div>
        );
    }

    // Text input
    return (
        <input
            type={htmlType}
            value={value}
            onChange={(e) => !readOnly && onChange(e.target.value)}
            placeholder={placeholder}
            className={baseStyles}
            disabled={disabled}
            readOnly={readOnly}
        />
    );
}
