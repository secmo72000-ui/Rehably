import { useState } from 'react';
import { useLocale } from '@/shared/hooks';
import { getTranslation } from '@/shared/i18n';

export interface Treatment {
  id: string;
  name: string;
  code: string;
  category: string;
  affectedArea: string;
  sessions: number;
  minWeeks: number;
  maxWeeks: number;
  reviewSource: string;
}

const mockTreatments: Treatment[] = Array.from({ length: 8 }).map(() => ({
  id: 'Dia-10',
  name: 'Neck pain with mobility deficits',
  code: 'M54.2',
  category: 'Cervical Spine',
  affectedArea: 'cervical_spine',
  sessions: 8,
  minWeeks: 2,
  maxWeeks: 12,
  reviewSource: 'Neck Pain CPG - Mobility Deficits',
}));

export function useLibrariesPage() {
  const { locale } = useLocale();

  const [activeTab, setActiveTab] = useState('treatments');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Handlers
  const handleTabChange = (id: string) => setActiveTab(id);
  const handleAddTreatment = () => console.log('Add treatment');
  
  return {
    locale,
    activeTab,
    handleTabChange,
    searchQuery,
    setSearchQuery,
    handleAddTreatment,
    treatments: mockTreatments
  };
}
