export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  profileImageUrl?: string | null;
  isActive: boolean;
  roles: string[];
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface InviteStaffRequest {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
}

export interface UpdateStaffRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export interface StaffQueryParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
