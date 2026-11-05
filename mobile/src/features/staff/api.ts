import { apiRequest } from '@/api/client';

import type { AddStaffRequest, EditStaffRequest, StaffListResponse, StaffMutationResponse } from './types';

export const staffKeys = {
  all: ['staff'] as const,
};

export function getStaff(signal?: AbortSignal): Promise<StaffListResponse> {
  return apiRequest<StaffListResponse>('/api/pharmacy/users', { signal });
}

export function addStaff(body: AddStaffRequest): Promise<StaffMutationResponse> {
  return apiRequest<StaffMutationResponse>('/api/auth/add-user', { method: 'POST', body });
}

export function editStaff(userId: number, body: EditStaffRequest): Promise<StaffMutationResponse> {
  return apiRequest<StaffMutationResponse>(`/api/auth/users/${userId}`, { method: 'PATCH', body });
}

export function deleteStaff(userId: number): Promise<{ message: string }> {
  return apiRequest(`/api/auth/users/${userId}`, { method: 'DELETE' });
}
