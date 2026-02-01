"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

export interface RadioOption {
  value: string;
  label: string;
  color?: "green" | "red" | "yellow" | "blue" | "gray";
}

export interface RadioGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Options to display */
  options: RadioOption[];
  /** Current value */
  value?: string;
  /** Error message to display */
  error?: string;
  /** Controlled onChange handler */
  onChange?: (value: string) => void;
  /** Layout direction */
  direction?: "horizontal" | "vertical";
  /** Whether the radio group is in RTL mode */
  isRtl?: boolean;
}

const colorStyles: Record<string, { bg: string; border: string; text: string }> = {
  green: {
    bg: "bg-green-100",
    border: "border-green-500",
    text: "text-green-700"
  },
  red: {
    bg: "bg-red-100",
    border: "border-red-500",
    text: "text-red-700"
  },
  yellow: {
    bg: "bg-yellow-100",
    border: "border-yellow-500",
    text: "text-yellow-700"
  },
  blue: {
    bg: "bg-blue-100",
    border: "border-blue-500",
    text: "text-blue-700"
  },
  gray: {
    bg: "bg-gray-100",
    border: "border-gray-500",
    text: "text-gray-700"
  }
};

export const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
  ({ 
    options,
    value,
    error, 
    onChange,
    direction = "horizontal",
    isRtl = true,
    disabled,
    name,
    ...props 
  }, ref) => {
    return (
      <div className="w-full">
        <div 
          className={cn(
            "flex gap-3",
            direction === "vertical" ? "flex-col" : "flex-row flex-wrap"
          )}
        >
          {options.map((option, index) => {
            const isSelected = value === option.value;
            const colorStyle = option.color ? colorStyles[option.color] : null;
            
            return (
              <label
                key={option.value}
                className={cn(
                  // Base styles
                  "relative flex items-center gap-2 px-4 py-2",
                  "rounded-lg cursor-pointer transition-all duration-200",
                  "border",
                  
                  // Selected state with color
                  isSelected && colorStyle ? [
                    colorStyle.bg,
                    colorStyle.border,
                    colorStyle.text
                  ] : isSelected ? [
                    "bg-Primary-50",
                    "border-Primary-500",
                    "text-Primary-700"
                  ] : [
                    "bg-white",
                    "border-gray-200",
                    "text-gray-700",
                    "hover:border-gray-300"
                  ],
                  
                  // Disabled state
                  disabled && "opacity-60 cursor-not-allowed"
                )}
              >
                <input
                  ref={index === 0 ? ref : undefined}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  disabled={disabled}
                  onChange={(e) => onChange?.(e.target.value)}
                  className="sr-only"
                  {...props}
                />
                
                {/* Custom radio indicator */}
                <span 
                  className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    "transition-all duration-200",
                    isSelected && colorStyle
                      ? colorStyle.border
                      : isSelected 
                        ? "border-Primary-500" 
                        : "border-gray-300"
                  )}
                >
                  {isSelected && (
                    <span 
                      className={cn(
                        "w-2 h-2 rounded-full",
                        colorStyle 
                          ? colorStyle.border.replace("border-", "bg-")
                          : "bg-Primary-500"
                      )}
                    />
                  )}
                </span>
                
                <span className="text-sm font-medium">
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
        
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

RadioGroup.displayName = "RadioGroup";
