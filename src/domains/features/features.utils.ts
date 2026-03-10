import type { Feature, FeatureCategory } from './features.types';

/**
 * Checks if a feature code matches library patterns.
 */
export function isLibraryFeature(code: string): boolean {
    return code.toLowerCase().includes('librar') || code.toLowerCase().includes('lib');
}

/**
 * Groups features that are strictly libraries
 */
export function getGroupedLibraries(features: Feature[], categories: FeatureCategory[]): Feature[] {
    return features.filter(f => 
        isLibraryFeature(f.code) || 
        categories.find(c => c.id === f.categoryId)?.code?.toLowerCase().includes('library')
    );
}

/**
 * Groups basic non-library features
 */
export function getGroupedBasicFeatures(features: Feature[], groupedLibraries: Feature[]): Feature[] {
    return features.filter(f => !groupedLibraries.includes(f));
}
