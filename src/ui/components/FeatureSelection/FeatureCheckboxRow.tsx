'use client';

import React from 'react';
import { cn } from '@/shared/utils/cn';

interface FeatureCheckboxRowProps {
    id: string;
    label: string;
    isSelected: boolean;
    onToggle: () => void;
    showQuantity?: boolean;
    quantity?: number | string;
    onQuantityChange?: (val: string) => void;
    quantityPlaceholder?: string;
    showLimit?: boolean;
    limit?: string;
    onLimitChange?: (val: string) => void;
    limitPlaceholder?: string;
    showDates?: boolean;
    startDate?: string;
    onStartDateChange?: (val: string) => void;
    endDate?: string;
    onEndDateChange?: (val: string) => void;
    isRtl?: boolean;
}

export function FeatureCheckboxRow({
    id,
    label,
    isSelected,
    onToggle,
    showQuantity,
    quantity,
    onQuantityChange,
    quantityPlaceholder,
    showLimit,
    limit,
    onLimitChange,
    limitPlaceholder,
    showDates,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
}: FeatureCheckboxRowProps) {
    const hasInputs = showQuantity || showLimit || showDates;

    return (
        <div className={cn(
            'flex items-center gap-4 py-2.5 max-w-3xl',
            hasInputs ? 'justify-between' : 'justify-start'


        )}>

            {/* Label + Checkbox on the right side (in RTL this appears on the right) */}
            <label
                htmlFor={id}
                className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
            >
                <input
                    id={id}
                    type="checkbox"
                    checked={isSelected}
                    onChange={onToggle}
                    className="w-4 h-4 rounded border-gray-300 text-Primary-500 focus:ring-Primary-400 cursor-pointer accent-Primary-500"
                />
                <span className="text-sm text-gray-600">{label}</span>

            </label>
            {/* Inputs on the left side (in RTL this appears on the left) */}
            {hasInputs && (
                <div className="flex items-center gap-2 shrink-0">
                    {showQuantity && (
                        <input
                            type="number"
                            min="0"
                            placeholder={quantityPlaceholder || 'حدود الباقة'}
                            value={isSelected ? quantity : ''}
                            onChange={(e) => onQuantityChange?.(e.target.value)}
                            disabled={!isSelected}
                            className={cn(
                                'w-36 border rounded-xl py-2.5 px-3 text-sm text-start transition-colors outline-none',
                                isSelected
                                    ? 'border-gray-200 text-gray-700 bg-white focus:border-Primary-400'
                                    : 'border-gray-100 text-gray-300 bg-gray-50/50 cursor-not-allowed'
                            )}
                        />
                    )}

                    {showLimit && (
                        <input
                            type="number"
                            min="0"
                            placeholder={limitPlaceholder || 'حدود الباقة'}
                            value={limit || ''}
                            onChange={(e) => onLimitChange?.(e.target.value)}
                            disabled={!isSelected}
                            className={cn(
                                'w-36 border rounded-xl py-2.5 px-3 text-sm text-start transition-colors outline-none',
                                isSelected
                                    ? 'border-gray-200 text-gray-700 bg-white focus:border-Primary-400'
                                    : 'border-gray-100 text-gray-300 bg-gray-50/50 cursor-not-allowed'
                            )}
                        />
                    )}

                    {showDates && (
                        <>
                            <input
                                type="date"
                                value={startDate || ''}
                                onChange={(e) => onStartDateChange?.(e.target.value)}
                                disabled={!isSelected}
                                className={cn(
                                    'w-[130px] border rounded-xl py-2 px-3 text-sm transition-colors outline-none',
                                    isSelected
                                        ? 'border-gray-200 text-gray-700 bg-white focus:border-Primary-400'
                                        : 'border-gray-100 text-gray-300 bg-gray-50/50 cursor-not-allowed'
                                )}
                            />
                            <input
                                type="date"
                                value={endDate || ''}
                                onChange={(e) => onEndDateChange?.(e.target.value)}
                                disabled={!isSelected}
                                className={cn(
                                    'w-[130px] border rounded-xl py-2 px-3 text-sm transition-colors outline-none',
                                    isSelected
                                        ? 'border-gray-200 text-gray-700 bg-white focus:border-Primary-400'
                                        : 'border-gray-100 text-gray-300 bg-gray-50/50 cursor-not-allowed'
                                )}
                            />
                        </>
                    )}
                </div>
            )}

            
        </div>
    );
}

export default FeatureCheckboxRow;
