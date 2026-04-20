import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale } from '@/shared/hooks';
import { getTranslation } from '@/shared/i18n';
import {
  treatmentsService,
  exercisesService,
  assessmentsService,
  stagesService,
  devicesService,
} from '@/domains/library';
import type {
  TreatmentDto,
  ExerciseDto,
  AssessmentDto,
  TreatmentStageDto,
  DeviceItem,
  CreateTreatmentRequest,
  CreateExerciseRequest,
  CreateAssessmentRequest,
  CreateStageRequest,
  CreateDeviceRequest,
} from '@/domains/library';

// ============ UI-facing types ============

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

export interface Device {
  id: string;
  name: string;
  description?: string;
  manufacturer?: string;
  model?: string;
  imageUrl?: string;
  relatedConditionCodes?: string;
}

// ============ Mappers ============

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

function mapDevice(dto: DeviceItem): Device {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? undefined,
    manufacturer: dto.manufacturer ?? undefined,
    model: dto.model ?? undefined,
    imageUrl: dto.imageUrl ?? undefined,
    relatedConditionCodes: dto.relatedConditionCodes ?? undefined,
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
  const [devices, setDevices] = useState<Device[]>([]);

  // Loading & error
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isStageDrawerOpen, setIsStageDrawerOpen] = useState(false);
  const [isExerciseDrawerOpen, setIsExerciseDrawerOpen] = useState(false);
  const [isAssessmentDrawerOpen, setIsAssessmentDrawerOpen] = useState(false);
  const [isDeviceDrawerOpen, setIsDeviceDrawerOpen] = useState(false);

  // Edit state (null = add mode, object = edit mode)
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  // Treatment Details Drawer state
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);

  // Search debounce
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQuery]);

  // ============ Fetch Functions ============

  const fetchTreatments = useCallback(async (search?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await treatmentsService.getAll({ page: 1, pageSize: 100, search: search || undefined });
      setTreatments(response.items.map(mapTreatment));
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to fetch treatments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStages = useCallback(async (search?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await stagesService.getAll({ page: 1, pageSize: 100, search: search || undefined });
      setStages(response.items.map(mapStage));
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to fetch stages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchExercises = useCallback(async (search?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await exercisesService.getAll({ page: 1, pageSize: 100, search: search || undefined });
      setExercises(response.items.map(mapExercise));
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to fetch exercises');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAssessments = useCallback(async (search?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await assessmentsService.getAll({ page: 1, pageSize: 100, search: search || undefined });
      setAssessments(response.items.map(mapAssessment));
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to fetch assessments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDevices = useCallback(async (search?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await devicesService.getAll({ page: 1, pageSize: 100, search: search || undefined });
      setDevices(response.items.map(mapDevice));
    } catch (err: any) {
      // Devices API may not exist yet — fail silently with empty list
      setDevices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============ Fetch on tab change ============

  useEffect(() => {
    switch (activeTab) {
      case 'treatments': fetchTreatments(); break;
      case 'stages': fetchStages(); break;
      case 'exercises': fetchExercises(); break;
      case 'assessments': fetchAssessments(); break;
      case 'devices': fetchDevices(); break;
    }
  }, [activeTab, fetchTreatments, fetchStages, fetchExercises, fetchAssessments, fetchDevices]);

  // ============ Re-fetch on search change ============

  useEffect(() => {
    switch (activeTab) {
      case 'treatments': fetchTreatments(debouncedSearch); break;
      case 'stages': fetchStages(debouncedSearch); break;
      case 'exercises': fetchExercises(debouncedSearch); break;
      case 'assessments': fetchAssessments(debouncedSearch); break;
      case 'devices': fetchDevices(debouncedSearch); break;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // ============ Tab Handlers ============

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setSearchQuery('');
    setDebouncedSearch('');
    setError(null);
  };

  const handleSortToggle = () => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');

  // ============ Treatment Handlers ============

  const handleAddTreatment = () => { setEditingTreatment(null); setIsDrawerOpen(true); };
  const handleCloseDrawer = () => { setIsDrawerOpen(false); setTimeout(() => setEditingTreatment(null), 300); };

  const handleSubmitTreatment = async (data: CreateTreatmentRequest) => {
    setIsSubmitting(true);
    try {
      if (editingTreatment) {
        await treatmentsService.update(editingTreatment.id, data);
      } else {
        await treatmentsService.create(data);
      }
      setIsDrawerOpen(false);
      setTimeout(() => setEditingTreatment(null), 300);
      await fetchTreatments(debouncedSearch);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to save treatment');
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
    setEditingTreatment(treatment);
    setIsDetailsDrawerOpen(false);
    setTimeout(() => setIsDrawerOpen(true), 300);
  };

  const handleDeleteTreatment = async (treatment: Treatment) => {
    try {
      await treatmentsService.delete(treatment.id);
      setTreatments(prev => prev.filter(t => t.id !== treatment.id));
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to delete treatment');
    }
  };

  // ============ Stage Handlers ============

  const handleAddStage = () => { setEditingStage(null); setIsStageDrawerOpen(true); };
  const handleCloseStageDrawer = () => { setIsStageDrawerOpen(false); setTimeout(() => setEditingStage(null), 300); };

  const handleSubmitStage = async (data: CreateStageRequest) => {
    setIsSubmitting(true);
    try {
      if (editingStage) {
        await stagesService.update(editingStage.id, data);
      } else {
        await stagesService.create(data);
      }
      setIsStageDrawerOpen(false);
      setTimeout(() => setEditingStage(null), 300);
      await fetchStages(debouncedSearch);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to save stage');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStage = (stage: Stage) => {
    setEditingStage(stage);
    setIsStageDrawerOpen(true);
  };

  const handleDeleteStage = async (stage: Stage) => {
    try {
      await stagesService.delete(stage.id);
      setStages(prev => prev.filter(s => s.id !== stage.id));
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to delete stage');
    }
  };

  // ============ Exercise Handlers ============

  const handleAddExercise = () => { setEditingExercise(null); setIsExerciseDrawerOpen(true); };
  const handleCloseExerciseDrawer = () => { setIsExerciseDrawerOpen(false); setTimeout(() => setEditingExercise(null), 300); };

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
      if (editingExercise) {
        await exercisesService.update(editingExercise.id, request, data.media ?? undefined);
      } else {
        await exercisesService.create(request, data.media ?? undefined);
      }
      setIsExerciseDrawerOpen(false);
      setTimeout(() => setEditingExercise(null), 300);
      await fetchExercises(debouncedSearch);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to save exercise');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setIsExerciseDrawerOpen(true);
  };

  const handleDeleteExercise = async (exercise: Exercise) => {
    try {
      await exercisesService.delete(exercise.id);
      setExercises(prev => prev.filter(e => e.id !== exercise.id));
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to delete exercise');
    }
  };

  // ============ Assessment Handlers ============

  const handleAddAssessment = () => { setEditingAssessment(null); setIsAssessmentDrawerOpen(true); };
  const handleCloseAssessmentDrawer = () => { setIsAssessmentDrawerOpen(false); setTimeout(() => setEditingAssessment(null), 300); };

  const handleSubmitAssessment = async (data: CreateAssessmentRequest) => {
    setIsSubmitting(true);
    try {
      if (editingAssessment) {
        await assessmentsService.update(editingAssessment.id, data);
      } else {
        await assessmentsService.create(data);
      }
      setIsAssessmentDrawerOpen(false);
      setTimeout(() => setEditingAssessment(null), 300);
      await fetchAssessments(debouncedSearch);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to save assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAssessment = (assessment: Assessment) => {
    setEditingAssessment(assessment);
    setIsAssessmentDrawerOpen(true);
  };

  const handleDeleteAssessment = async (assessment: Assessment) => {
    try {
      await assessmentsService.delete(assessment.id);
      setAssessments(prev => prev.filter(a => a.id !== assessment.id));
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to delete assessment');
    }
  };

  // ============ Device Handlers ============

  const handleAddDevice = () => { setEditingDevice(null); setIsDeviceDrawerOpen(true); };
  const handleCloseDeviceDrawer = () => { setIsDeviceDrawerOpen(false); setTimeout(() => setEditingDevice(null), 300); };

  const handleSubmitDevice = async (data: CreateDeviceRequest, image?: File) => {
    setIsSubmitting(true);
    try {
      if (editingDevice) {
        await devicesService.update(editingDevice.id, data, image);
      } else {
        await devicesService.create(data, image);
      }
      setIsDeviceDrawerOpen(false);
      setTimeout(() => setEditingDevice(null), 300);
      await fetchDevices(debouncedSearch);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to save device');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDevice = (device: Device) => {
    setEditingDevice(device);
    setIsDeviceDrawerOpen(true);
  };

  const handleDeleteDevice = async (device: Device) => {
    try {
      await devicesService.delete(device.id);
      setDevices(prev => prev.filter(d => d.id !== device.id));
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to delete device');
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

    // Treatment drawers
    isDrawerOpen,
    editingTreatment,
    handleAddTreatment,
    handleCloseDrawer,
    handleSubmitTreatment,
    selectedTreatment,
    isDetailsDrawerOpen,
    handleOpenDetails,
    handleCloseDetails,
    handleEditTreatment,
    handleDeleteTreatment,

    // Stage drawers
    isStageDrawerOpen,
    editingStage,
    handleAddStage,
    handleCloseStageDrawer,
    handleSubmitStage,
    handleEditStage,
    handleDeleteStage,

    // Exercise drawers
    isExerciseDrawerOpen,
    editingExercise,
    handleAddExercise,
    handleCloseExerciseDrawer,
    handleSubmitExercise,
    handleEditExercise,
    handleDeleteExercise,

    // Assessment drawers
    isAssessmentDrawerOpen,
    editingAssessment,
    handleAddAssessment,
    handleCloseAssessmentDrawer,
    handleSubmitAssessment,
    handleEditAssessment,
    handleDeleteAssessment,

    // Device drawers
    isDeviceDrawerOpen,
    editingDevice,
    handleAddDevice,
    handleCloseDeviceDrawer,
    handleSubmitDevice,
    handleEditDevice,
    handleDeleteDevice,

    // Data
    treatments,
    stages,
    exercises,
    assessments,
    devices,

    isLoading,
    isSubmitting,
    error,
  };
}
