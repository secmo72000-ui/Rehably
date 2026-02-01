"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/shared/utils/cn";

export interface MultiSelectOption {
    value: string;
    label: string;
}

export interface MultiSelectInputProps {
    /** Selected values */
    value: string[];
    /** Available options */
    options: MultiSelectOption[];
    /** Change handler */
    onChange: (values: string[]) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Label */
    label?: string;
    /** Error message */
    error?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Additional className */
    className?: string;
}

export function MultiSelectInput({
    value = [],
    options,
    onChange,
    placeholder = "اختر من القائمة",
    label,
    error,
    disabled = false,
    className,
}: MultiSelectInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Get label for a value
    const getLabel = (val: string) => {
        return options.find((opt) => opt.value === val)?.label || val;
    };

    // Toggle option
    const toggleOption = (optionValue: string) => {
        if (value.includes(optionValue)) {
            onChange(value.filter((v) => v !== optionValue));
        } else {
            onChange([...value, optionValue]);
        }
    };

    // Remove a selected value
    const removeValue = (val: string) => {
        onChange(value.filter((v) => v !== val));
    };

    // Get unselected options
    const availableOptions = options.filter((opt) => !value.includes(opt.value));

    return (
        <div className={cn("w-full", className)} ref={containerRef}>
            {/* Label */}
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                    {label}
                </label>
            )}

            {/* Input Container */}
            <div className="relative">
                <div
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={cn(
                        "w-full min-h-[48px] px-4 py-2",
                        "text-base text-gray-900 text-right",
                        "bg-white border border-gray-300",
                        "rounded-lg",
                        "transition-all duration-200",
                        "cursor-pointer",
                        // Focus state
                        isOpen && "ring-2 ring-Primary-500 border-Primary-500",
                        // Error state
                        error && "border-red-500 ring-red-500",
                        // Disabled state
                        disabled && "bg-gray-50 cursor-not-allowed opacity-60",
                        // Flex container for tags
                        "flex flex-wrap gap-2 items-center"
                    )}
                >
                    {/* Selected Tags */}
                    {value.length > 0 ? (
                        value.map((val) => (
                            <span
                                key={val}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg border border-gray-300"
                            >
                                <span>{getLabel(val)}</span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeValue(val);
                                    }}
                                    className="hover:bg-gray-200 rounded p-0.5 transition-colors"
                                >
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 14 14"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </button>
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-400 flex-1">{placeholder}</span>
                    )}

                    {/* Dropdown Icon */}
                    <svg
                        className={cn(
                            "w-5 h-5 text-gray-400 transition-transform mr-auto",
                            isOpen && "rotate-180"
                        )}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>

                {/* Dropdown List */}
                {isOpen && availableOptions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {availableOptions.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => toggleOption(option.value)}
                                className="px-4 py-3 text-right cursor-pointer hover:bg-gray-50 transition-colors text-gray-900"
                            >
                                {option.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <p className="mt-1 text-sm text-red-600 text-right">{error}</p>
            )}
        </div>
    );
}
