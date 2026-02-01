"use client";

import { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";
import { FilterButton } from "../FilterButton";

export interface ContentContainerProps {
    /** Optional title for the container */
    title?: string;
    /** Children content to render inside */
    children: ReactNode;
    /** Show filter button */
    showFilter?: boolean;
    /** Filter button label */
    filterLabel?: string;
    /** Filter button click handler */
    onFilterClick?: () => void;
    /** Additional header actions (buttons, etc.) */
    headerAction?: ReactNode;
    /** Additional className */
    className?: string;
}

export function ContentContainer({
    title,
    children,
    showFilter = false,
    filterLabel = "الأحدث",
    onFilterClick,
    headerAction,
    className,
}: ContentContainerProps) {
    const hasHeader = title || showFilter || headerAction;

    return (
        <div className={cn("bg-white rounded-lg shadow-lg p-5", className)}>
            {/* Header Section */}
            {hasHeader && (
                <div className="flex items-center justify-between mb-5">
                    {/* Title */}
                    <div className="flex-1">
                        {title && (
                            <h2 className=" text-xl font-bold text-gray-900">{title}</h2>
                        )}
                    </div>

                    {/* Right side actions */}
                    <div className="flex justify-end gap-3">
                        {/* Filter Button */}
                        {showFilter && (
                            <FilterButton label={filterLabel} onClick={onFilterClick || (() => { })} />
                        )}

                        {/* Additional header actions */}
                        {headerAction}
                    </div>
                </div>
            )}

            {/* Content */}
            <div>{children}</div>
        </div>
    );
}
