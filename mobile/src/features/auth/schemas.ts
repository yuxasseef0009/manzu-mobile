import { z } from 'zod';

import { isValidStateLga } from '@/lib/nigeria';

// Same rules/messages as manzu-f app/pharmacy/(auth)/login/page.jsx and backend loginSchema.
export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  pin: z.string().length(6, 'PIN must be exactly 6 digits').regex(/^\d{6}$/, 'PIN must contain only numbers'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

const NIGERIAN_PHONE = /^(\+234|0)[789]\d{9}$/;

// manzu-b registerSchema rules (lengths, phone regex, Nigeria bounds) + state/LGA pairing (utils/location.js).
export const registerSchema = z
  .object({
    name: z.string().trim().min(3, 'Pharmacy name must be at least 3 characters').max(255),
    licenseNumber: z.string().trim().min(5, 'License number must be at least 5 characters').max(50),
    phone: z.string().trim().regex(NIGERIAN_PHONE, 'Enter a valid Nigerian phone number (e.g. 08012345678)'),
    address: z.string().trim().min(10, 'Address must be at least 10 characters').max(500),
    state: z.string().min(2, 'State is required'),
    lga: z.string().min(2, 'LGA is required'),
    latitude: z.number().min(4, 'Capture your pharmacy location').max(14, 'Location must be within Nigeria'),
    longitude: z.number().min(3, 'Capture your pharmacy location').max(15, 'Location must be within Nigeria'),
    locationAccuracy: z.number(),
    userName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().trim().email('Invalid email address'),
    pin: z.string().length(6, 'PIN must be exactly 6 digits').regex(/^\d{6}$/, 'PIN must contain only numbers'),
    confirmPin: z.string(),
  })
  .refine((v) => isValidStateLga(v.state, v.lga), { path: ['lga'], message: 'Select an LGA in the chosen state' })
  .refine((v) => v.pin === v.confirmPin, { path: ['confirmPin'], message: 'PINs do not match' });

export type RegisterFormValues = z.infer<typeof registerSchema>;
