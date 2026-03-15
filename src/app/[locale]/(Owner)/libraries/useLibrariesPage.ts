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
  description?: string;
  redFlags?: string;
  contraindications?: string;
  clinicNotes?: string;
  sourceDetails?: string;
}

export interface Stage {
  id: string;
  code: string;
  order: number;
  title: string;
  description: string;
  minWeeks: number;
  maxWeeks: number;
  minSessions: number;
  maxSessions: number;
  mainGoal: string;
  clinicNotes: string;
}

const mockStages: Stage[] = Array.from({ length: 4 }).map((_, i) => ({
  id: `stage-${i}`,
  code: 'M54.5',
  order: i + 1,
  title: 'المرحلة الاولى | بداية التعامل مع الألم',
  description: 'يعاني المريض من ألم في أسفل الظهر يمتد إلى الساق اليسرى، مما يؤثر على الحركة والأنشطة اليومية.',
  minWeeks: 3,
  maxWeeks: 6,
  minSessions: 4,
  maxSessions: 6,
  mainGoal: 'يعاني المريض من ألم في أسفل الظهر يمتد إلى الساق اليسرى، مما يؤثر على الحركة والأنشطة اليومية.',
  clinicNotes: 'يعاني المريض من ألم في أسفل الظهر يمتد إلى الساق اليسرى، مما يؤثر على الحركة والأنشطة اليومية.'
}));

export interface Exercise {
  id: string;
  title: string;
  description: string;
  reps: number;
  sets: number;
  holdTime: number; // in seconds
  videoUrl?: string; 
}

export interface Assessment {
  id: string;
  title: string;
  code: string;
  description: string;
  frequency: string;
}

const mockExercises: Exercise[] = Array.from({ length: 9 }).map((_, i) => ({
  id: `exercise-${i}`,
  title: 'اسم التمرين',
  description: 'وصف التمرين وصف التمرين وصف التمرين وصف التمرين وصف التمرين وصف التمرين وصف التمرين وصف التمرين وصف التمرين وصف التمرين وصف التمرين وصف التمرين وصف التمرين',
  reps: 15,
  sets: 15,
  holdTime: 20
}));

const mockAssessments: Assessment[] = Array.from({ length: 4 }).map((_, i) => ({
  id: `assessment-${i}`,
  code: 'M54.5',
  title: 'NPRS (Numeric Pain Rating Scale)',
  description: 'During active treatment phase',
  frequency: 'كل اسبوعين'
}));

const mockTreatments: Treatment[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `Dia-10-${i}`,
  name: 'Neck pain with mobility deficits',
  code: 'M54.5',
  category: 'Cervical Spine',
  affectedArea: 'cervical_spine',
  sessions: 6,
  minWeeks: 3,
  maxWeeks: 6,
  reviewSource: 'Neck Pain CPG – Mobility Deficits',
  description: 'Mechanical neck pain without serious pathology, typically localized to the cervical region with movement-related aggravation and mobility restriction.',
  redFlags: 'History of malignancy; Unexplained weight loss; Recent significant trauma; Progressive neurological deficit; Signs of myelopathy (gait disturbance, bowel or bladder dysfunction); Fever, chills, or systemic infection signs',
  contraindications: 'Suspected cervical fracture or instability; Acute cervical myelopathy; Vertebral artery insufficiency; Suspected infection or malignancy of the cervical spine',
  clinicNotes: 'Use for non-specific cervicalgia without radicular symptoms or major trauma; follow neck pain CPG mobility-deficit pathway.',
  sourceDetails: 'Derived from APTA/JOSPT Neck Pain Clinical Practice Guidelines (neck pain with mobility deficits subgroup) and ICD-10 cervicalgia (M54.2). Protocol adapted for Rehably.'
}));

export function useLibrariesPage() {
  const { locale } = useLocale();
  const t = (key: string) => getTranslation(locale, `libraries.${key}`);

  const [activeTab, setActiveTab] = useState('treatments');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isStageDrawerOpen, setIsStageDrawerOpen] = useState(false);
  const [isExerciseDrawerOpen, setIsExerciseDrawerOpen] = useState(false);

  // Treatment Details Drawer state
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  
  // Handlers
  const handleTabChange = (id: string) => setActiveTab(id);
  const handleSortToggle = () => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  
  const handleAddTreatment = () => setIsDrawerOpen(true);
  const handleCloseDrawer = () => setIsDrawerOpen(false);

  const handleOpenDetails = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setIsDetailsDrawerOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsDrawerOpen(false);
    setTimeout(() => setSelectedTreatment(null), 300);
  };

  const handleEditTreatment = (treatment: Treatment) => {
     console.log('Edit treatment', treatment);
  };

  const handleDeleteTreatment = (treatment: Treatment) => {
     console.log('Delete treatment', treatment);
  };

  const handleEditStage = (stage: Stage) => {
     console.log('Edit stage', stage);
  };

  const handleDeleteStage = (stage: Stage) => {
     console.log('Delete stage', stage);
  };

  const handleAddStage = () => {
     setIsStageDrawerOpen(true);
  };
  
  const handleCloseStageDrawer = () => {
     setIsStageDrawerOpen(false);
  };

  const handleEditExercise = (exercise: Exercise) => {
     console.log('Edit exercise', exercise);
  };

  const handleDeleteExercise = (exercise: Exercise) => {
     console.log('Delete exercise', exercise);
  };

  const handleEditAssessment = (assessment: any) => {
     console.log('Edit assessment', assessment);
  };

  const handleDeleteAssessment = (assessment: any) => {
     console.log('Delete assessment', assessment);
  };

  const handleAddAssessment = () => {
     console.log('Add assessment');
  };

  const handleAddExercise = () => {
     setIsExerciseDrawerOpen(true);
  };
  
  const handleCloseExerciseDrawer = () => {
     setIsExerciseDrawerOpen(false);
  };
  
  return {
    locale,
    t,
    activeTab,
    handleTabChange,
    searchQuery,
    setSearchQuery,
    sortDirection,
    handleSortToggle,
    isDrawerOpen,
    handleAddTreatment,
    handleCloseDrawer,
    isStageDrawerOpen,
    handleAddStage,
    handleCloseStageDrawer,
    selectedTreatment,
    isDetailsDrawerOpen,
    handleOpenDetails,
    handleCloseDetails,
    handleEditTreatment,
    handleDeleteTreatment,
    handleEditStage,
    handleDeleteStage,
    handleEditExercise,
    handleDeleteExercise,
    isExerciseDrawerOpen,
    handleAddExercise,
    handleCloseExerciseDrawer,
    treatments: mockTreatments,
    stages: mockStages,
    exercises: mockExercises,
    assessments: mockAssessments,
    handleEditAssessment,
    handleDeleteAssessment,
    handleAddAssessment
  };
}
