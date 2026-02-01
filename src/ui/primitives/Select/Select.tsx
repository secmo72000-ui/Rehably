"use client";

import { forwardRef, type SelectHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  /** Options to display */
  options: SelectOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Icon to display at the start */
  icon?: ReactNode;
  /** Error message to display */
  error?: string;
  /** Controlled onChange handler */
  onChange?: (value: string) => void;
  /** Whether the select is in RTL mode */
  isRtl?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    options,
    placeholder = "اختر...",
    icon, 
    error, 
    onChange,
    isRtl = true,
    disabled,
    value,
    ...props 
  }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            // Base styles
            "w-full py-2.5 md:py-3 border rounded-xl md:rounded-2xl",
            "text-sm md:text-base text-gray-700",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-Primary-400 focus:border-transparent",
            "appearance-none cursor-pointer",
            "bg-white",
            
            // RTL/LTR padding
            isRtl ? [
              icon ? "pe-10 md:pe-12 ps-10" : "pe-4 ps-10",
              "text-right"
            ] : [
              icon ? "ps-10 md:ps-12 pe-10" : "ps-4 pe-10",
              "text-left"
            ],
            
            // Placeholder style when no value
            !value && "text-gray-400",
            
            // Border color
            error 
              ? "border-red-500 focus:ring-red-400" 
              : "border-gray-200",
            
            // Disabled state
            disabled && "bg-gray-100 cursor-not-allowed opacity-60",
            
            className
          )}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Start Icon */}
        {icon && (
          <span 
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none",
              isRtl 
                ? "end-3 md:end-4" 
                : "start-3 md:start-4"
            )}
          >
            {icon}
          </span>
        )}
        
        {/* Dropdown Arrow */}
        <span 
          className={cn(
            "absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none",
            isRtl 
              ? "start-3 md:start-4" 
              : "end-3 md:end-4"
          )}
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
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </span>
        
        {/* Error Message */}
        {error && (
          <p className={cn(
            "mt-1 text-xs text-red-500",
            isRtl ? "text-right" : "text-left"
          )}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
