"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Icon to display at the start of the input (based on text direction) */
  icon?: ReactNode;
  /** Icon/button to display at the end of the input (based on text direction) */
  endIcon?: ReactNode;
  /** Error message to display */
  error?: string;
  /** Controlled onChange handler */
  onChange?: (value: string) => void;
  /** Whether the input is in RTL mode */
  isRtl?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = "text", 
    icon, 
    endIcon, 
    error, 
    onChange,
    isRtl = false,
    disabled,
    ...props 
  }, ref) => {
    return (
      <div className="relative w-full">
        <input
          type={type}
          ref={ref}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            // Base styles
            "w-full py-2.5 md:py-3 border rounded-xl md:rounded-2xl",
            "text-sm md:text-base text-gray-700 placeholder-gray-400",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-Primary-400 focus:border-transparent",
            
            // RTL/LTR padding based on icons
            isRtl ? [
              icon && "pe-10 md:pe-12",
              endIcon && "ps-10 md:ps-12",
              !icon && !endIcon && "px-4",
              icon && !endIcon && "ps-4",
              !icon && endIcon && "pe-4",
              icon && endIcon && "",
              "text-right"
            ] : [
              icon && "ps-10 md:ps-12",
              endIcon && "pe-10 md:pe-12",
              !icon && !endIcon && "px-4",
              !icon && endIcon && "ps-4",
              icon && !endIcon && "pe-4",
              icon && endIcon && "",
              "text-left"
            ],
            
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
        
        {/* Start Icon */}
        {icon && (
          <span 
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-gray-400",
              isRtl 
                ? "end-3 md:end-4" 
                : "start-3 md:start-4"
            )}
          >
            {icon}
          </span>
        )}
        
        {/* End Icon */}
        {endIcon && (
          <span 
            className={cn(
              "absolute top-1/2 -translate-y-1/2",
              isRtl 
                ? "start-3 md:start-4" 
                : "end-3 md:end-4"
            )}
          >
            {endIcon}
          </span>
        )}
        
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

Input.displayName = "Input";

