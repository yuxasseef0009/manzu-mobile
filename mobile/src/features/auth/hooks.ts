import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { profileQueryOptions } from '@/features/profile/api';
import { isManager } from '@/lib/roles';

import { login, register } from './api';
import { SESSION_EXPIRED_MESSAGE } from './messages';
import { useRole, useSession } from './store';
import type { LoginRequest, RegisterRequest } from './types';

export function useLogin() {
  const signIn = useSession((s) => s.signIn);
  return useMutation({
    mutationFn: (values: LoginRequest) => login(values),
    onSuccess: (data) => signIn(data),
  });
}

/** Registration returns a session token for the new MANAGER, so the user lands signed in. */
export function useRegister() {
  const signIn = useSession((s) => s.signIn);
  return useMutation({
    mutationFn: (values: RegisterRequest) => register(values),
    onSuccess: (data) => signIn(data),
  });
}

/**
 * Validates the stored token on launch / foreground via GET /api/pharmacy/profile
 * (manzu-b has no /api/auth/verify). A 401 signs out via the API client hook.
 * Also signs out when the JWT's exp passes (no refresh tokens: daily re-login, PLAN D5).
 */
export function useSessionValidation() {
  const status = useSession((s) => s.status);
  const expiresAt = useSession((s) => s.expiresAt);
  const applyProfile = useSession((s) => s.applyProfile);
  const signOut = useSession((s) => s.signOut);

  const profile = useQuery({
    ...profileQueryOptions,
    enabled: status === 'signedIn',
  });

  useEffect(() => {
    if (profile.data) void applyProfile(profile.data);
  }, [profile.data, applyProfile]);

  useEffect(() => {
    if (status !== 'signedIn' || !expiresAt) return;
    const ms = expiresAt - Date.now();
    if (ms <= 0) {
      void signOut(SESSION_EXPIRED_MESSAGE);
      return;
    }
    // setTimeout overflows above ~24.8 days; JWTs here last 1 day.
    const timer = setTimeout(() => void signOut(SESSION_EXPIRED_MESSAGE), Math.min(ms, 2_147_000_000));
    return () => clearTimeout(timer);
  }, [status, expiresAt, signOut]);

  return profile;
}

export function useIsManager(): boolean {
  return isManager(useRole());
}
