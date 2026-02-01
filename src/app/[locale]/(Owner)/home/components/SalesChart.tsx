'use client';

import React from 'react';
import Image from 'next/image';

interface SalesChartProps {
    title: string;
    filterLabel: string;
    totalSales: string;
    percentage: string;
}

export const SalesChart: React.FC<SalesChartProps> = ({ title, filterLabel, totalSales, percentage }) => {

    // Legend items configuration
    const legendItems = [
        { label: 'Packag1', color: 'bg-[#FFC107]' }, // Yellow
        { label: 'Package2', color: 'bg-[#FD7E14]' }, // Orange
        { label: 'Package3', color: 'bg-[#F50057]' }, // Pink
        { label: 'Costume Packages', color: 'bg-[#2979FF]' }, // Blue
    ];

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm w-full h-[400px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 px-6">

                <h3 className="text-base font-medium text-[#475467]">{title}</h3>
                <div className="flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer">
                    <span className="text-sm text-[#475467]">{filterLabel}</span>
                    <Image src="/shered/arrow-down.svg" alt="arrow" width={10} height={10} />
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative">

                {/* Donut Chart using Conic Gradient */}
                <div
                    className="relative w-48 h-48 rounded-full flex items-center justify-center shadow-sm"
                    style={{
                        background: `conic-gradient(
                            #FFC107 0% 25%, 
                            #FD7E14 25% 50%, 
                            #F50057 50% 70%, 
                            #2979FF 70% 100%
                        )`
                    }}
                >
                    {/* Inner White Circle */}
                    <div className="absolute w-36 h-36 bg-white rounded-full flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-[#101828]">{totalSales}</span>
                        <span className="text-sm font-medium text-[#039855]">{percentage}</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-4 mt-8 w-full px-2">
                    {legendItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-[#475467]">
                            <div className={`w-2.5 h-2.5 rounded-full ${item.color}`}></div>
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
