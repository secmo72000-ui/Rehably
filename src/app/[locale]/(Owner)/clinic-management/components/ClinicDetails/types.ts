import { Clinic } from "@/domains/clinics/clinics.types";
import type { Package } from '@/domains/packages/packages.types';
import type { Feature, FeatureCategory } from '@/domains/features/features.types';

export interface ClinicDetailsProps {
    clinic: Clinic | null;
    packageDetails?: Package;
    features?: Feature[];
    categories?: FeatureCategory[];
    featuresLoading?: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onRefresh?: () => void;
}
