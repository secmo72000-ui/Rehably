'use client';

import React from 'react';
import { cn } from '@/shared/utils/cn';
import { DataRowProps } from './types';
import { DataCell } from './DataCell';

export function DataRow({
    cells,
    columns,
    gap,
    className
}: DataRowProps) {
    // Determine grid columns based on explicitly provided columns prop or cells length
    // Capping at 3 columns as per requirements, but flexible if needed
    const colCount = columns || Math.min(cells.length, 3);

    const gridClass = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-3',
    }[colCount] || 'grid-cols-1';

    return (
        <div
            className={cn(
                "grid items-center w-full ",
                gap || "gap-4",
                gridClass,
                className
            )}
        >
            {cells.map((cell, index) => (
                <div key={index} className="w-full">
                    <DataCell {...cell} />
                </div>
            ))}
        </div>
    );
}

export default DataRow;
