'use client';

import React from 'react';
import Image from 'next/image';

interface SubscriptionsChartProps {
    title: string;
    filterLabel: string;
}

const data = [
    { month: 'يناير', value: 25 },
    { month: 'فبراير', value: 24 },
    { month: 'مارس', value: 18 },
    { month: 'ابريل', value: 22 },
    { month: 'مايو', value: 49, active: true }, // Highest
    { month: 'يونيو', value: 32 },
    { month: 'يوليو', value: 18 },
    { month: 'اغسطس', value: 15 },
    { month: 'سبتمبر', value: 36 },
    { month: 'اكتوبر', value: 26 },
    { month: 'نوفمبر', value: 34 },
    { month: 'ديسمبر', value: 26 },
];

export const SubscriptionsChart: React.FC<SubscriptionsChartProps> = ({ title, filterLabel }) => {
    const maxValue = 50;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm w-full h-[400px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#FF884D] rounded-sm"></div>
                    <span className="text-sm text-[#475467]">{title}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer">
                    <span className="text-sm text-[#475467]">{filterLabel}</span>
                    <Image src="/shered/arrow-down.svg" alt="arrow" width={10} height={10} />
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 flex gap-4 relative">
                {/* Y Axis */}
                <div className="flex flex-col justify-between text-xs text-[#98A2B3] pb-6 h-full">
                    <span>50</span>
                    <span>40</span>
                    <span>30</span>
                    <span>20</span>
                    <span>10</span>
                    <span>00</span>
                </div>

                {/* Bars Area */}
                <div className="flex-1 flex items-end justify-between border-b border-[#F2F4F7] pb-0 h-full relative z-0">
                    {/* Horizontal Grid lines (visual only, simplified) */}
                    <div className="absolute w-full h-full flex flex-col justify-between z-[-1 pb-6">
                        <div className="border-t border-dashed border-[#F2F4F7] w-full h-0"></div>
                        <div className="border-t border-dashed border-[#F2F4F7] w-full h-0"></div>
                        <div className="border-t border-dashed border-[#F2F4F7] w-full h-0"></div>
                        <div className="border-t border-dashed border-[#F2F4F7] w-full h-0"></div>
                        <div className="border-t border-dashed border-[#F2F4F7] w-full h-0"></div>
                        <div className="border-t border-dashed border-[#F2F4F7] w-full h-0"></div>
                    </div>

                    {data.map((item, index) => (
                        <div key={index} className="flex flex-col items-center gap-2 h-full justify-end group">
                            <div
                                className={`w-4 md:w-6 transition-all duration-500 rounded-t-sm ${item.active ? 'bg-[#FF884D]' : 'bg-[#FF884D] opacity-80 group-hover:opacity-100'}`}
                                style={{ height: `${(item.value / maxValue) * 80}%` }} // 80% to leave space for labels
                            >
                                {/* Tooltip could go here */}
                            </div>
                            <span className="text-xs text-[#98A2B3]">{item.month}</span>
                        </div>
                    ))}
                </div>
            </div>
            {/* X-Axis labels are included in the map above */}
        </div>
    );
};
