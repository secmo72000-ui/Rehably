"use client";

import Image from "next/image";
import { cn } from "@/shared/utils/cn";

export interface FilterButtonProps {
    /** Current filter label */
    label: string;
    /** Click handler */
    onClick: () => void;
    /** Additional className */
    className?: string;
}

export function FilterButton({ label, onClick, className }: FilterButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-[28px] py-4 border-[1.5px] border-Primary-300 rounded-lg",
                "hover:bg-Primary-50 transition-colors",
                "cursor-pointer text-[#4A4A4A]",
                "text-base-bold ",
                className
            )}
        >
            <Image
                src="/shered/table/Filter.svg"
                alt="Filter"
                width={20}
                height={20}
            />
            <span>{label}</span>
        </button>
    );
}
