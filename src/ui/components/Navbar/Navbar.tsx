"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/shared/utils/cn";
import Image from "next/image";


/** Default logo path - can be overridden by clinic's custom logo */
const DEFAULT_LOGO_SRC = "/Admin/Navbar/logo.png";

/** User data for navbar display */
export interface NavbarUser {
  /** User's display name */
  name: string;
  /** User's email address */
  email: string;
  /** User's avatar image URL */
  avatarUrl?: string;
}

export interface NavbarProps {
  /** Toggle sidebar visibility */
  onToggleSidebar: () => void;
  /** User data - name, email, avatar */
  user?: NavbarUser;
  /** Custom user section component - overrides default user display */
  userSection?: ReactNode;
  /** Notification count (0 = no badge, undefined = no notifications section) */
  notificationCount?: number;
  /** Notification click handler */
  onNotificationClick?: () => void;
  /** Custom notification section - overrides default */
  notificationSection?: ReactNode;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Search value */
  searchValue?: string;
  /** Search change handler */
  onSearchChange?: (value: string) => void;
  /** Logo component - takes priority over logoSrc */
  logo?: ReactNode;
  /** 
   * Custom logo source path (for clinic uploaded logos)
   * Will be used if logo prop is not provided
   * Falls back to default Rehably logo if not provided
   */
  logoSrc?: string;
  /** Is RTL layout */
  isRtl?: boolean;
  /** Additional className */
  className?: string;
}

export function Navbar({
  onToggleSidebar,
  user,
  userSection,
  notificationCount = 0,
  onNotificationClick,
  notificationSection,
  searchPlaceholder = "البحث",
  searchValue = "",
  onSearchChange,
  logo,
  logoSrc,
  isRtl = false,
  className,
}: NavbarProps) {
  const [logoError, setLogoError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Determine the logo source - use custom if provided, otherwise use default
  const currentLogoSrc = logoSrc || DEFAULT_LOGO_SRC;

  // Get user initials for avatar fallback
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  return (
    <nav
      data-navbar

      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "h-16 md:h-[88px]",
        "bg-white border-b border-grey-100",
        "flex items-center justify-between",
        "px-4 md:px-20 ",
        "shadow-sm",
        className
      )}
    >
      {/* Left Section - Logo & Menu Toggle */}
      <div className={cn("flex items-center gap-3", isRtl && "flex-row-reverse")}>
        {/* Menu Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className={cn(
            "p-2 rounded-lg",
            "text-grey-600 hover:text-Primary-500",
            "hover:bg-grey-50",
            "transition-colors duration-200",
            "lg:hidden"
          )}
          aria-label="Toggle sidebar"
        >
          <MenuIcon className="w-6 h-6" />
        </button>

        {/* Logo */}
        {logo || (
          logoError ? (
            // Fallback text logo when image fails to load
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-Primary-500 to-Primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-xl font-bold text-Primary-600 hidden sm:block">Rehably</span>
            </div>
          ) : (
            <Image
              src={currentLogoSrc}
              alt="Rehably Logo"
              width={190}
              height={90}
              priority
              onError={() => setLogoError(true)}
            />
          )
        )}
      </div>

      {/* Right Section - Search, Notifications & User */}
      <div className={cn("flex items-center gap-3 md:gap-6")}>
        {/* Search Bar */}
        <div className={cn(
          "hidden md:flex items-center gap-2",
          "px-4 py-2",
          "bg-grey-50 rounded-lg",
          "border border-grey-200",
          "focus-within:border-Primary-300 focus-within:ring-2 focus-within:ring-Primary-100",
          "transition-all duration-200",
          "min-w-[200px] lg:min-w-[280px]",
          isRtl && "flex-row-reverse"
        )}>
          <SearchIcon className="w-4 h-4 text-grey-400 shrink-0" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className={cn(
              "flex-1 bg-transparent outline-none",
              "text-sm text-grey-700 placeholder:text-grey-400",
              isRtl && "text-right"
            )}
          />
        </div>

        {/* Notifications */}
        {notificationSection || (
          <button
            onClick={onNotificationClick}
            className={cn(
              "relative p-2 rounded-full ",
              "text-grey-500 hover:text-Primary-500",
              "hover:bg-grey-50",
              "transition-colors duration-200"
            )}
            aria-label="Notifications"
          >
            <Image
              src="/Admin/Navbar/Notification.svg"
              alt="Notifications"
              width={20}
              height={20}
            />
            {/* Notification Badge */}
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-error-600 rounded-full" />
            )}
          </button>
        )}

        {/* User Section */}
        {userSection || (
          <div className={cn(
            "flex items-center gap-3"
          )}>
            {/* Avatar */}
            <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden bg-Primary-100 flex items-center justify-center shrink-0">
              {user?.avatarUrl && !avatarError ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name || "User avatar"}
                  fill
                  className="object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <span className="text-Primary-600 font-semibold text-base md:text-lg">
                  {userInitial}
                </span>
              )}
            </div>

            {/* User Info */}
            <div className={cn(
              "hidden md:flex flex-col",
              isRtl ? "items-end" : "items-start"
            )}>
              <span className="text-sm font-semibold text-grey-800">
                {user?.name || "User Name"}
              </span>
              <span className="text-xs text-grey-500">
                {user?.email || "user@example.com"}
              </span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Icons
function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 12H21M3 6H21M3 18H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
