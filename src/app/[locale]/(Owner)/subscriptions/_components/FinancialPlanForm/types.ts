import type { FinancialPlanFormValues } from '../../types';
import type { Feature, FeatureCategory } from '@/domains/features/features.types';

export interface FinancialPlanFormProps {
    initialValues?: Partial<FinancialPlanFormValues>;
    onSubmit: (values: FinancialPlanFormValues) => void;
    onCancel: () => void;
    isLoading?: boolean;
    features: Feature[];
    categories: FeatureCategory[];
    t?: (key: string) => string;
}
