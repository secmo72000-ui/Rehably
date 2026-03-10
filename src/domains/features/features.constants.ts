export interface LibraryType {
    code: string;
    nameKey: string;
}

export const LIBRARY_TYPES: LibraryType[] = [
    { code: 'treatments', nameKey: 'wizard.step3.libTreatments' },
    { code: 'exercises', nameKey: 'wizard.step3.libExercises' },
    { code: 'modalities', nameKey: 'wizard.step3.libModalities' },
    { code: 'assessments', nameKey: 'wizard.step3.libAssessments' },
    { code: 'devices', nameKey: 'wizard.step3.libDevices' },
    { code: 'body-regions', nameKey: 'wizard.step3.libBodyRegions' },
];
