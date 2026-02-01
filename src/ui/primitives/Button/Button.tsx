"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Full width button */
  fullWidth?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Icon to display before text */
  startIcon?: ReactNode;
  /** Icon to display after text */
  endIcon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-Primary-500 hover:bg-Primary-600 text-white shadow-md hover:shadow-lg",
  secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700",
  outline: "border-2 border-Primary-500 text-Primary-500 hover:bg-Primary-50",
  ghost: "text-gray-600 hover:bg-gray-100",
  danger: "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "py-1.5 px-3 text-sm",
  md: "py-2.5 md:py-3 px-4 md:px-5 text-sm md:text-base",
  lg: "py-3 md:py-4 px-6 md:px-8 text-base md:text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = "primary",
    size = "md",
    fullWidth = false,
    isLoading = false,
    startIcon,
    endIcon,
    disabled,
    children,
    ...props 
  }, ref) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base styles
          "font-semibold rounded-lg transition-all duration-200",
          "active:scale-[0.98]",
          "flex items-center justify-center gap-2",
          
          // Variant styles
          variantStyles[variant],
          
          // Size styles
          sizeStyles[size],
          
          // Full width
          fullWidth && "w-full",
          
          // Disabled state
          isDisabled && "opacity-60 cursor-not-allowed hover:shadow-md",
          
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg 
            className="animate-spin h-5 w-5" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            {startIcon}
            {children}
            {endIcon}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

