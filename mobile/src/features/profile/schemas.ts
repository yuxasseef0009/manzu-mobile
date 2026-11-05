import { z } from 'zod';

import { isValidStateLga, isWithinNigeria } from '@/lib/nigeria';

const pin = z.string().length(6, 'PIN must be exactly 6 digits').regex(/^\d{6}$/, 'PIN must contain only numbers');

// manzu-b editProfileSchema rules + state/LGA pairing from utils/location.js.
export const profileFormSchema = z
  .object({
    userName: z.string().trim().min(1, 'Name is required'),
    userEmail: z.string().trim().email('Invalid email address'),
    name: z.string().trim().min(1, 'Pharmacy name is required'),
    address: z.string().trim().min(1, 'Address is required'),
    state: z.string().min(1, 'State is required'),
    lga: z.string().min(1, 'LGA is required'),
    ward: z.string(),
    phone: z.string().trim().min(10, 'Phone number is required'),
    deliveryAvailability: z.boolean(),
  })
  .refine((v) => isValidStateLga(v.state, v.lga), { path: ['lga'], message: 'Select an LGA in the chosen state' });

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const coordinatesSchema = z
  .object({
    latitude: z.string().trim().min(1, 'Latitude is required'),
    longitude: z.string().trim().min(1, 'Longitude is required'),
  })
  .superRefine((v, ctx) => {
    const lat = Number(v.latitude);
    const lng = Number(v.longitude);
    if (!Number.isFinite(lat)) ctx.addIssue({ code: 'custom', path: ['latitude'], message: 'Enter a valid number' });
    if (!Number.isFinite(lng)) ctx.addIssue({ code: 'custom', path: ['longitude'], message: 'Enter a valid number' });
    if (Number.isFinite(lat) && Number.isFinite(lng) && !isWithinNigeria(lat, lng)) {
      ctx.addIssue({ code: 'custom', path: ['latitude'], message: 'Coordinates must be within Nigeria (4–14°N, 3–15°E)' });
    }
  });

export type CoordinatesFormValues = z.infer<typeof coordinatesSchema>;

// Web handleChangePin checks: 6 digits + confirmation match.
export const changePinSchema = z
  .object({ currentPin: pin, newPin: pin, confirmPin: z.string() })
  .refine((v) => v.newPin === v.confirmPin, { path: ['confirmPin'], message: 'New PINs do not match' });

export type ChangePinFormValues = z.infer<typeof changePinSchema>;
