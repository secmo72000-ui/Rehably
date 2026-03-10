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
