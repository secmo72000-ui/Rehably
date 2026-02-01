import React from 'react';
import Image from 'next/image';

export interface StatsCardProps {
    title: string;
    value: string | number;
    trend: number; // Percentage (e.g., 17, -11)
    className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, trend, className = '' }) => {
    const isPositive = trend >= 0;

    // Config based on trend direction
    const trendConfig = isPositive
        ? {
            bg: 'bg-[#0398551A]', // Light Green
            text: 'text-[#039855]',
            icon: '/shered/arrow-up.svg'
        }
        : {
            bg: 'bg-[#FEE4E2]', // Light Red/Pink
            text: 'text-[#D92D20]',
            icon: '/shered/arrow-down.svg'
        };

    // Format trend label (e.g. "+17%" or "-11") as shown in design
    // Design shows arrows and number percent

    return (
        <div className={`bg-white rounded-lg p-6 shadow-sm flex flex-col items-center justify-start gap-4 ${className}`}>
            {/* Title */}
            <h3 className="text-base font-medium text-[#667085]  flex w-full justify-start">{title}</h3>

            {/* Content Row: Badge - Value */}
            <div className="flex items-center justify-between w-full px-4">

                    <span className="text-3xl font-bold text-[#101828]">{value}</span>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-md ${trendConfig.bg} ${trendConfig.text}`}>
                    <Image
                        src={isPositive ? "/shered/trend-up.svg" : "/shered/trend-down.svg"}
                        alt="trend"
                        width={12}
                        height={12}
                    />
                    <span className="text-sm font-medium direction-ltr">
                        {Math.abs(trend)}{isPositive ? '%' : ''}
                    </span>
                </div>

                {/* Value */}
            </div>
        </div>
    );
};
