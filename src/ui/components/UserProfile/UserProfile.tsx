"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/shared/utils/cn";

export interface UserProfileProps {
    /** User's display name */
    name: string;
    /** User's email address */
    email: string;
    /** User's avatar image URL */
    avatarUrl?: string;
    /** Is RTL layout */
    isRtl?: boolean;
    /** Size variant */
    size?: "sm" | "md" | "lg";
    /** Additional className */
    className?: string;
}

const sizeConfig = {
    sm: {
        avatar: "w-8 h-8",
        nameText: "text-xs",
        emailText: "text-xs",
        initial: "text-sm",
    },
    md: {
        avatar: "w-10 h-10 md:w-11 md:h-11",
        nameText: "text-sm",
        emailText: "text-xs",
        initial: "text-base md:text-lg",
    },
    lg: {
        avatar: "w-12 h-12",
        nameText: "text-base",
        emailText: "text-sm",
        initial: "text-lg",
    },
};

export function UserProfile({
    name,
    email,
    avatarUrl,
    isRtl = true,
    size = "md",
    className,
}: UserProfileProps) {
    const [avatarError, setAvatarError] = useState(false);

    // Get user initials for avatar fallback
    const userInitial = name ? name.charAt(0).toUpperCase() : "U";
    const config = sizeConfig[size];

    return (
        <div
            className={cn("flex items-center gap-3", isRtl && "flex-row-reverse", className)}
        >
            

            {/* User Info */}
            <div
                className={cn(
                    "flex flex-col",
                    isRtl ? "items-start" : "items-end"
                )}
            >
                <span className={cn("font-semibold text-grey-800", config.nameText)}>
                    {name}
                </span>
                <span className={cn("text-grey-500", config.emailText)}>
                    {email}
                </span>
            </div>
            {/* Avatar */}
            <div
                className={cn(
                    "relative rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0",
                    config.avatar
                )}
            >
                {avatarUrl && !avatarError ? (
                    <Image
                        src={avatarUrl}
                        alt={name || "User avatar"}
                        fill
                        className="object-cover"
                        onError={() => setAvatarError(true)}
                    />
                ) : (
                    <span className={cn("text-white font-semibold", config.initial)}>
                        {userInitial}
                    </span>
                )}
            </div>
        </div>
    );
}
