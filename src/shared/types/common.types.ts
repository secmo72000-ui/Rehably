// ============ API Response Wrappers ============

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============ Base Entities ============

/**
 * Base entity with common fields
 */
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string | null;
}

// ============ Common UI Types ============

/**
 * Select option for dropdowns
 */
export interface SelectOption {
  value: string | number;
  label: string;
}

// ============ Status Enums ============

export type Status = 'active' | 'inactive' | 'pending' | 'suspended';

export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';

export type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'checked_in' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';
