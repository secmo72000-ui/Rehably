"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  /** Label text for the checkbox */
  label?: string;
  /** Controlled onChange handler */
  onChange?: (checked: boolean) => void;
  /** Whether the checkbox is in RTL mode */
  isRtl?: boolean;
  /** Error message */
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    className, 
    label,
    checked,
    onChange,
    isRtl = false,
    disabled,
    error,
    ...props 
  }, ref) => {
    return (
      <div className="flex flex-col">
        <label 
          className={cn(
            "flex items-center gap-1.5 md:gap-2 cursor-pointer",
            disabled && "cursor-not-allowed opacity-60",
            isRtl && "flex-row-reverse"
          )}
        >
          <input
            type="checkbox"
            ref={ref}
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange?.(e.target.checked)}
            className={cn(
              "w-3.5 h-3.5 md:w-4 md:h-4",
              "text-Primary-500 border-gray-300 rounded",
              "focus:ring-Primary-400 focus:ring-2",
              "cursor-pointer",
              disabled && "cursor-not-allowed",
              error && "border-red-500",
              className
            )}
            {...props}
          />
          {label && (
            <span className={cn(
              "text-xs md:text-sm text-gray-600",
              error && "text-red-500"
            )}>
              {label}
            </span>
          )}
        </label>
        
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

Checkbox.displayName = "Checkbox";

