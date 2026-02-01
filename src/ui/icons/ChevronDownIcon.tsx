"use client";

import type { SVGProps } from "react";

interface ChevronDownIconProps extends SVGProps<SVGSVGElement> {
    className?: string;
}

export function ChevronDownIcon({ className = "h-5 w-5", ...props }: ChevronDownIconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            {...props}
        >
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}
