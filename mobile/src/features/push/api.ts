import { apiRequest } from '@/api/client';

/** PLAN D6: existing single-token endpoint (Pharmacy.devicetoken, last device wins, no unregister — G4). */
export function registerDeviceToken(deviceToken: string): Promise<{ message: string }> {
  return apiRequest('/api/pharmacy/notifications/register', { method: 'POST', body: { deviceToken } });
}
