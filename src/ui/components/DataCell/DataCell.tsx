'use client';

import React from 'react';
import { cn } from '@/shared/utils/cn';
import { DataCellProps } from './types';
import { GeneralInput } from '@/ui/primitives';

export function DataCell({
    variant,
    value,
    badge,
    badgeColor = 'gray',
    options,
    onChange,
    checked,
    content,
    className,
    label,
    placeholder
}: DataCellProps) {

    const renderContent = () => {
        switch (variant) {
            case 'text':
                return (
                    <div className="flex items-center h-full">
                        <span className="text-xl-regular text-text">{value}</span>
                    </div>
                );

            case 'text-with-badge':
                return (
                    <div className="flex  ga h-full bg-mint-50 rounded p-2 justify-center">
                        <span className="text-xl-regular text-text">{value}</span>
                        {badge && <div className="shrink-0">{badge}</div>}
                    </div>
                );

            case 'selector':
                return (
                    <div className="w-full">
                        <GeneralInput
                            type="select"
                            value={String(value || '')}
                            onChange={(val) => onChange?.(val)}
                            options={options || []}
                            placeholder={placeholder || 'Select...'}
                            className="w-full"
                        />
                    </div>
                );

            case 'checkbox':
                return (
                    <div className="flex items-center h-full">
                        <input
                            type="checkbox"
                            checked={!!checked}
                            onChange={(e) => onChange?.(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        {label && <span className="mr-2 text-sm text-gray-900">{label}</span>}
                    </div>
                );

            case 'custom':
                return <div className="h-full">{content}</div>;

            default:
                return null;
        }
    };

    return (
        <div className={cn("min-h-[40px] flex flex-col justify-center", className)}>
            {renderContent()}
        </div>
    );
}

export default DataCell;
