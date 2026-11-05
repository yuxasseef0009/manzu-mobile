import { apiRequest } from '@/api/client';

import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from './types';

export function login(credentials: LoginRequest): Promise<LoginResponse> {
  // Same sanitising as manzu-f pharmacyAuthAPI.login.
  const body: LoginRequest = {
    email: String(credentials.email).trim().toLowerCase().slice(0, 200),
    pin: String(credentials.pin).trim(),
  };
  return apiRequest<LoginResponse>('/api/auth/login', { method: 'POST', body, auth: false });
}

export function register(body: RegisterRequest): Promise<RegisterResponse> {
  const user = { ...body.user, email: body.user.email.trim().toLowerCase() };
  return apiRequest<RegisterResponse>('/api/auth/register', { method: 'POST', body: { ...body, user }, auth: false });
}
