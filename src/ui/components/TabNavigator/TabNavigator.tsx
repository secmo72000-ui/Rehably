"use client";

import { cn } from "@/shared/utils/cn";

export interface Tab {
    id: string;
    label: string;
}

export interface TabNavigatorProps {
    /** Array of tabs */
    tabs: Tab[];
    /** Currently active tab ID */
    activeTab: string;
    /** Callback when tab is clicked */
    onTabChange: (tabId: string) => void;
    /** Additional className */
    className?: string;
}

export function TabNavigator({
    tabs,
    activeTab,
    onTabChange,
    className,
}: TabNavigatorProps) {
    return (
        <div className={cn("flex gap-2 ", className)}>
            {tabs.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            // Base styles
                            "bg-white p-4 transition-all duration-200",
                            "rounded-lg",
                            // Typography
                            "text-base font-bold",
                            // Shadow
                            "shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1)]",
                            // Text color
                            "text-[#484E54]",
                            // Active state
                            isActive
                                ? "border-Primary-300 border-2"
                                : "hover:bg-gray-50"
                        )}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
