import { useState, useEffect, useCallback } from 'react';
import { useLocale } from '@/shared/hooks';
import { getTranslation } from '@/shared/i18n';
import {
  treatmentsService,
  exercisesService,
  assessmentsService,
  stagesService,
} from '@/domains/library';
import type {
  TreatmentDto,
  ExerciseDto,
  AssessmentDto,
  TreatmentStageDto,
  CreateTreatmentRequest,
  CreateExerciseRequest,
  CreateAssessmentRequest,
  CreateStageRequest,
} from '@/domains/library';

// ============ UI-facing types (kept for backward compat with components) ============

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

export interface Exercise {
  id: string;
  title: string;
  description: string;
  reps: number;
  sets: number;
  holdTime: number;
  videoUrl?: string;
}

export interface Assessment {
  id: string;
  title: string;
  code: string;
  description: string;
  frequency: string;
}

// ============ Mappers (Backend DTO → UI type) ============

function mapTreatment(dto: TreatmentDto): Treatment {
  return {
    id: dto.id,
    name: dto.name,
    code: dto.code,
    category: dto.bodyRegionCategoryName ?? '',
    affectedArea: dto.affectedArea,
    sessions: dto.expectedSessions,
    minWeeks: dto.minDurationWeeks,
    maxWeeks: dto.maxDurationWeeks,
    reviewSource: dto.sourceReference ?? '',
    description: dto.description ?? undefined,
    redFlags: dto.redFlags ?? undefined,
    contraindications: dto.contraindications ?? undefined,
    clinicNotes: dto.clinicalNotes ?? undefined,
    sourceDetails: dto.sourceDetails ?? undefined,
  };
}

function mapStage(dto: TreatmentStageDto, index: number): Stage {
  return {
    id: dto.id,
    code: dto.code,
    order: index + 1,
    title: dto.name,
    description: dto.description ?? '',
    minWeeks: dto.minWeeks ?? 0,
    maxWeeks: dto.maxWeeks ?? 0,
    minSessions: dto.minSessions ?? 0,
    maxSessions: dto.maxSessions ?? 0,
    mainGoal: dto.description ?? '',
    clinicNotes: '',
  };
}

function mapExercise(dto: ExerciseDto): Exercise {
  return {
    id: dto.id,
    title: dto.name,
    description: dto.description ?? '',
    reps: dto.repeats ?? 0,
    sets: dto.steps ?? 0,
    holdTime: dto.holdSeconds ?? 0,
    videoUrl: dto.videoUrl ?? undefined,
  };
}

function mapAssessment(dto: AssessmentDto): Assessment {
  return {
    id: dto.id,
    title: dto.name,
    code: dto.code,
    description: dto.description ?? '',
    frequency: dto.timePoint !== undefined ? String(dto.timePoint) : '',
  };
}

// ============ Hook ============

export function useLibrariesPage() {
  const { locale } = useLocale();
  const t = (key: string) => getTranslation(locale, `libraries.${key}`);

  // Tab state
  const [activeTab, setActiveTab] = useState('treatments');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  // Data state
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  // Loading & error
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isStageDrawerOpen, setIsStageDrawerOpen] = useState(false);
  const [isExerciseDrawerOpen, setIsExerciseDrawerOpen] = useState(false);

  // Treatment Details Drawer state
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);

  // ============ Fetch Functions ============

  const fetchTreatments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await treatmentsService.getAll({ page: 1, pageSize: 100 });
      setTreatments(response.items.map(mapTreatment));
    } catch (err: any) {
      console.error('Failed to fetch treatments', err);
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to fetch treatments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await stagesService.getAll({ page: 1, pageSize: 100 });
      setStages(response.items.map(mapStage));
    } catch (err: any) {
      console.error('Failed to fetch stages', err);
      setError(err?.response?.data?.error?.message || err.message || 'Failed to fetch stages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchExercises = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await exercisesService.getAll({ page: 1, pageSize: 100 });
      setExercises(response.items.map(mapExercise));
    } catch (err: any) {
      console.error('Failed to fetch exercises', err);
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to fetch exercises');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAssessments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await assessmentsService.getAll({ page: 1, pageSize: 100 });
      setAssessments(response.items.map(mapAssessment));
    } catch (err: any) {
      console.error('Failed to fetch assessments', err);
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to fetch assessments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============ Fetch on tab change ============

  useEffect(() => {
    switch (activeTab) {
      case 'treatments':
        fetchTreatments();
        break;
      case 'stages':
        fetchStages();
        break;
      case 'exercises':
        fetchExercises();
        break;
      case 'assessments':
        fetchAssessments();
        break;
    }
  }, [activeTab, fetchTreatments, fetchStages, fetchExercises, fetchAssessments]);

  // ============ Tab Handlers ============

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setSearchQuery('');
    setError(null);
  };

  const handleSortToggle = () => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');

  // ============ Treatment Handlers ============

  const handleAddTreatment = () => setIsDrawerOpen(true);
  const handleCloseDrawer = () => setIsDrawerOpen(false);

  const handleSubmitTreatment = async (data: CreateTreatmentRequest) => {
    setIsSubmitting(true);
    try {
      await treatmentsService.create(data);
      setIsDrawerOpen(false);
      await fetchTreatments();
    } catch (err: any) {
      console.error('Failed to create treatment', err);
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to create treatment');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handleDeleteTreatment = async (treatment: Treatment) => {
    try {
      await treatmentsService.delete(treatment.id);
      setTreatments(prev => prev.filter(t => t.id !== treatment.id));
    } catch (err: any) {
      console.error('Failed to delete treatment', err);
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to delete treatment');
    }
  };

  // ============ Stage Handlers ============

  const handleAddStage = () => setIsStageDrawerOpen(true);
  const handleCloseStageDrawer = () => setIsStageDrawerOpen(false);

  const handleSubmitStage = async (data: CreateStageRequest) => {
    setIsSubmitting(true);
    try {
      await stagesService.create(data);
      setIsStageDrawerOpen(false);
      await fetchStages();
    } catch (err: any) {
      console.error('Failed to create stage', err);
      setError(err?.response?.data?.error?.message || err.message || 'Failed to create stage');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStage = (stage: Stage) => {
    console.log('Edit stage', stage);
  };

  const handleDeleteStage = async (stage: Stage) => {
    try {
      await stagesService.delete(stage.id);
      setStages(prev => prev.filter(s => s.id !== stage.id));
    } catch (err: any) {
      console.error('Failed to delete stage', err);
      setError(err?.response?.data?.error?.message || err.message || 'Failed to delete stage');
    }
  };

  // ============ Exercise Handlers ============

  const handleAddExercise = () => setIsExerciseDrawerOpen(true);
  const handleCloseExerciseDrawer = () => setIsExerciseDrawerOpen(false);

  const handleSubmitExercise = async (data: { name: string; description: string; bodyArea: string; relatedDisease: string; categories: string; repeats: string; steps: string; hold: string; media: File | null }) => {
    setIsSubmitting(true);
    try {
      const request: CreateExerciseRequest = {
        name: data.name,
        description: data.description,
        bodyRegionCategoryId: data.bodyArea || '00000000-0000-0000-0000-000000000000',
        relatedConditionCode: data.relatedDisease,
        tags: data.categories,
        repeats: data.repeats ? parseInt(data.repeats) : undefined,
        steps: data.steps ? parseInt(data.steps) : undefined,
        holdSeconds: data.hold ? parseInt(data.hold) : undefined,
      };
      await exercisesService.create(request, data.media ?? undefined);
      setIsExerciseDrawerOpen(false);
      await fetchExercises();
    } catch (err: any) {
      console.error('Failed to create exercise', err);
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to create exercise');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditExercise = (exercise: Exercise) => {
    console.log('Edit exercise', exercise);
  };

  const handleDeleteExercise = async (exercise: Exercise) => {
    try {
      await exercisesService.delete(exercise.id);
      setExercises(prev => prev.filter(e => e.id !== exercise.id));
    } catch (err: any) {
      console.error('Failed to delete exercise', err);
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to delete exercise');
    }
  };

  // ============ Assessment Handlers ============

  const handleAddAssessment = () => {
    console.log('Add assessment — drawer not implemented yet');
  };

  const handleSubmitAssessment = async (data: CreateAssessmentRequest) => {
    setIsSubmitting(true);
    try {
      await assessmentsService.create(data);
      await fetchAssessments();
    } catch (err: any) {
      console.error('Failed to create assessment', err);
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to create assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAssessment = (assessment: Assessment) => {
    console.log('Edit assessment', assessment);
  };

  const handleDeleteAssessment = async (assessment: Assessment) => {
    try {
      await assessmentsService.delete(assessment.id);
      setAssessments(prev => prev.filter(a => a.id !== assessment.id));
    } catch (err: any) {
      console.error('Failed to delete assessment', err);
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to delete assessment');
    }
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
    handleSubmitTreatment,
    isStageDrawerOpen,
    handleAddStage,
    handleCloseStageDrawer,
    handleSubmitStage,
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
    handleSubmitExercise,
    treatments,
    stages,
    exercises,
    assessments,
    handleEditAssessment,
    handleDeleteAssessment,
    handleAddAssessment,
    handleSubmitAssessment,
    isLoading,
    isSubmitting,
    error,
  };
}
