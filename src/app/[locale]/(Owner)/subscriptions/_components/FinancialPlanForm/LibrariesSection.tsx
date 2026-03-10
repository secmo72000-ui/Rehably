import React from 'react';
import type { Feature } from '@/domains/features/features.types';
import { FeatureCheckboxRow } from '@/ui/components/FeatureSelection';

interface LibrariesSectionProps {
    libraries: Feature[];
    selectedLibraries: string[];
    onChange: (selected: string[]) => void;
    t: (key: string) => string;
}

export function LibrariesSection({ libraries, selectedLibraries, onChange, t }: LibrariesSectionProps) {
    const handleToggle = (id: string) => {
        if (selectedLibraries.includes(id)) {
            onChange(selectedLibraries.filter(libId => libId !== id));
        } else {
            onChange([...selectedLibraries, id]);
        }
    };

    if (libraries.length === 0) return null;

    return (
        <div className="space-y-3 mt-4">
            <p className="text-xs font-semibold text-gray-900 mb-2">{t('libraries') || 'اختر المكتبات'}</p>
            {libraries.map((library) => {
                const isSelected = selectedLibraries.includes(String(library.id));
                return (
                    <FeatureCheckboxRow
                        key={library.id}
                        id={`library-${library.id}`}
                        label={library.description || library.name}
                        isSelected={isSelected}
                        onToggle={() => handleToggle(String(library.id))}
                        // No limit needed for libraries based on UI
                        showLimit={false}
                    />
                );
            })}
        </div>
    );
}
