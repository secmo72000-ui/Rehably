'use client';

import { cn } from '@/shared/utils/cn';

interface Step {
    label: string;
}

interface StepIndicatorProps {
    steps: Step[];
    currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-center w-full max-w-md mx-auto mb-8">
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentStep;
                const isActive = stepNumber === currentStep;
                const isLast = index === steps.length - 1;

                return (
                    <div key={index} className="flex items-center flex-1 last:flex-none">
                        {/* Step circle + label */}
                        <div className="flex flex-col items-center gap-1">
                            <div
                                className={cn(
                                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 border-2',
                                    isCompleted && 'bg-Primary-500 border-Primary-500 text-white',
                                    isActive && 'border-Primary-500 bg-white text-Primary-500',
                                    !isCompleted && !isActive && 'border-grey-300 bg-white text-grey-400'
                                )}
                            >
                                {isCompleted ? (
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span className="w-2 h-2 rounded-full bg-current" />
                                )}
                            </div>
                            <span
                                className={cn(
                                    'text-xs font-medium whitespace-nowrap',
                                    isActive || isCompleted ? 'text-grey-700' : 'text-grey-400'
                                )}
                            >
                                {step.label}
                            </span>
                        </div>

                        {/* Connector line */}
                        {!isLast && (
                            <div className="flex-1 mt-[-18px]">
                                <div
                                    className={cn(
                                        'h-[1px] w-full transition-colors duration-300',
                                        isCompleted ? 'bg-Primary-500' : 'bg-grey-200'
                                    )}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
