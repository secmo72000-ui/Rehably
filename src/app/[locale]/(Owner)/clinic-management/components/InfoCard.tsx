"use client";

import Image from "next/image";
import { cn } from "@/shared/utils/cn";

export interface InfoCardProps {
    /** Icon source path */
    iconSrc: string;
    /** Label to display */
    label: string;
    /** Icon alt text */
    iconAlt?: string;
    /** Additional className */
    className?: string;
}

export function InfoCard({
    iconSrc,
    label,
    iconAlt = "Icon",
    className,
}: InfoCardProps) {
    return (
        <div className={cn("p-4 flex items-center gap-2", className)}>
            <Image
                src={iconSrc}
                alt={iconAlt}
                width={44}
                height={44}
                className=""
            />
            <div className="">
                <p className="text-sm text-gray-500">{label}</p>
            </div>
        </div>
    );
}
