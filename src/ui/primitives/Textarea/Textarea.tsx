"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  /** Error message to display */
  error?: string;
  /** Controlled onChange handler */
  onChange?: (value: string) => void;
  /** Whether the textarea is in RTL mode */
  isRtl?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    error, 
    onChange,
    isRtl = true,
    disabled,
    rows = 3,
    ...props 
  }, ref) => {
    return (
      <div className="relative w-full">
        <textarea
          ref={ref}
          rows={rows}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            // Base styles
            "w-full py-2.5 md:py-3 px-4 border rounded-xl md:rounded-2xl",
            "text-sm md:text-base text-gray-700 placeholder-gray-400",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-Primary-400 focus:border-transparent",
            "resize-none",
            
            // RTL/LTR
            isRtl ? "text-right" : "text-left",
            
            // Border color
            error 
              ? "border-red-500 focus:ring-red-400" 
              : "border-gray-200",
            
            // Disabled state
            disabled && "bg-gray-100 cursor-not-allowed opacity-60",
            
            className
          )}
          {...props}
        />
        
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

Textarea.displayName = "Textarea";
