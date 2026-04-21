export interface Feature {
    id: string;
    categoryId: string;
    name: string;
    code: string;
    description: string;
    pricingType: number;
    isAddOn: boolean;
    isActive: boolean;
    displayOrder: number;
    createdAt: string;
    updatedAt: string | null;
}

export interface FeatureCategory {
    id: string;
    name: string;
    code: string;
    description: string;
    icon?: string | null;
    displayOrder: number;
    parentCategoryId?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
    features?: Feature[];
}

export interface CreateFeatureRequest {
    categoryId: string;
    name: string;
    code: string;
    description?: string;
    pricingType: number;
    displayOrder: number;
}

export interface UpdateFeatureRequest {
    name: string;
    description?: string;
    displayOrder: number;
}

export interface CreateFeatureCategoryRequest {
    name: string;
    code: string;
    description?: string;
    displayOrder: number;
}

export interface UpdateFeatureCategoryRequest {
    name: string;
    description?: string;
    displayOrder: number;
}

export const PRICING_TYPE_LABELS: Record<number, string> = {
    0: 'لكل وحدة',
    1: 'لكل مستخدم',
    2: 'لكل GB',
    3: 'مجاني',
};

export const PRICING_TYPES = [
    { value: 0, label: 'لكل وحدة (PerUnit)' },
    { value: 1, label: 'لكل مستخدم (PerUser)' },
    { value: 2, label: 'لكل GB (PerStorageGB)' },
    { value: 3, label: 'مجاني (Free)' },
];
