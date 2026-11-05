import { queryOptions } from '@tanstack/react-query';

import { apiRequest } from '@/api/client';

import type { ChangePinRequest, LogoUploadFile, LogoUploadResponse, OperatingHourDraft, OperatingHoursResponse, ProfileResponse, UpdateProfileRequest } from './types';

export const profileKeys = {
  all: ['profile'] as const,
  operatingHours: () => ['profile', 'operating-hours'] as const,
};

export function getProfile(signal?: AbortSignal): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>('/api/pharmacy/profile', { signal });
}

export const profileQueryOptions = queryOptions({
  queryKey: profileKeys.all,
  queryFn: ({ signal }) => getProfile(signal),
  staleTime: 5 * 60_000,
});

export function updateProfile(body: UpdateProfileRequest): Promise<{ message: string }> {
  return apiRequest('/api/pharmacy/profile', { method: 'PATCH', body });
}

export function getOperatingHours(signal?: AbortSignal): Promise<OperatingHoursResponse> {
  return apiRequest<OperatingHoursResponse>('/api/pharmacy/operating-hours', { signal });
}

export function saveOperatingHours(hours: OperatingHourDraft[]): Promise<{ message: string }> {
  return apiRequest('/api/pharmacy/operating-hours', { method: 'POST', body: { hours } });
}

export function uploadLogo(file: LogoUploadFile): Promise<LogoUploadResponse> {
  const form = new FormData();
  // React Native FormData accepts { uri, name, type } file parts.
  form.append('logo', file as unknown as Blob);
  return apiRequest<LogoUploadResponse>('/api/pharmacy/profile/logo', { method: 'POST', formData: form, timeoutMs: 60_000 });
}

/** Working PIN endpoint (routes/auth.js). Never /api/pharmacy/change-password (G1). */
export function changePin(body: ChangePinRequest): Promise<{ message: string }> {
  return apiRequest('/api/auth/change-password', { method: 'PATCH', body });
}
