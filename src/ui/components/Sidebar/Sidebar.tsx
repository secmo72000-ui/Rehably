"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils/cn";

export interface SidebarItem {
  /** Unique identifier */
  id: string;
  /** Display label (translated) */
  label: string;
  /** Navigation href */
  href: string;
  /** Icon source path from public folder */
  iconSrc: string;
  /** Badge count (optional) */
  badge?: number;
}

export interface SidebarProps {
  /** Navigation items */
  items: SidebarItem[];
  /** Current locale */
  locale: string;
  /** Is sidebar open (mobile) */
  isOpen: boolean;
  /** Close sidebar callback */
  onClose: () => void;
  /** Is RTL layout */
  isRtl?: boolean;
  /** Additional className */
  className?: string;
  /** Logout label */
  logoutLabel?: string;
  /** Logout click handler */
  onLogout?: () => void;
}

export function Sidebar({
  items,
  locale,
  isOpen,
  onClose,
  isRtl = false,
  className,
  logoutLabel = "تسجيل الخروج",
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 md:top-22 bottom-0 z-40",
          "w-[200px] md:w-[230px] px-7 py-8",
          "bg-white border-grey-100",
          isRtl ? "right-0 border-l" : "left-0 border-r",
          "flex flex-col",
          "transition-transform duration-300 ease-in-out",
          // Mobile: hidden by default, show when open
          isOpen
            ? "translate-x-0"
            : isRtl
              ? "translate-x-full"
              : "-translate-x-full",
          // Desktop: always visible
          "lg:translate-x-0",
          className
        )}
      >
        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      " w-full flex items-center justify-center gap-2.5 px-4 py-2 rounded-t-xl",
                      "transition-all duration-200",
                      isActive
                        ? "bg-Primary-500 text-base-bold text-white "
                        : " text-base-regular text-grey-600  hover:bg-grey-50 hover:text-grey-800 "
                    )}
                  >
                    {/* Icon */}
                    <Image
                      src={item.iconSrc}
                      alt=""
                      width={24}
                      height={24}
                      className={cn("shrink-0", isActive && "icon-white")}
                    />

                    {/* Label */}
                    <span className="flex-1">{item.label}</span>

                    {/* Badge */}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          isActive
                            ? "bg-Primary-500 text-white"
                            : "bg-grey-200 text-grey-600"
                        )}
                      >
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="pt-4 border-t border-grey-100">
          <button
            onClick={onLogout}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg",
              "text-grey-600 hover:bg-error-50 hover:text-error-600",
              "transition-all duration-200"
            )}
          >
            <Image
              src="/Admin/Sidebar/logout.svg"
              alt=""
              width={20}
              height={20}
              className="shrink-0"
            />
            <span className="text-sm">{logoutLabel}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
