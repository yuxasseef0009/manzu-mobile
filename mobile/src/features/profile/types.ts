// GET /api/pharmacy/profile — manzu-b routes/pharmacy.js + pharmacy-profile.repository.js (findPharmacyUser / findPharmacy selects).
// Prisma DateTime/Time serialise as ISO strings; Decimal (latitude/longitude) serialises as string.
import type { PharmacyStatus, PharmacyType, PharmacyUserRole } from '@/features/auth/types';

export interface ProfileUser {
  id: number;
  name: string;
  email: string;
  role: PharmacyUserRole;
  lastLogin: string | null;
}

export interface ProfileOperatingHour {
  id: number;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

export interface ProfilePharmacy {
  id: number;
  name: string;
  address: string;
  lga: string;
  state: string;
  ward: string | null;
  phone: string;
  licenseNumber: string;
  status: PharmacyStatus;
  logoUrl: string | null;
  latitude: string | null;
  longitude: string | null;
  deliveryAvailability: boolean | null;
  pharmacyType: PharmacyType | null;
  isActive: boolean;
  createdAt: string;
  verifiedAt: string | null;
  OperatingHour: ProfileOperatingHour[];
}

export interface ProfileResponse {
  message: string;
  user: ProfileUser;
  pharmacy: ProfilePharmacy;
}

/** GET /operating-hours: times are UTC "HH:mm" slices; days without a row are closed. */
export interface OperatingHourSlot {
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
}

export interface OperatingHoursResponse {
  operatingHours: OperatingHourSlot[];
}

/** Web editor row; dayOfWeek 0 = Monday … 6 = Sunday (pharmacyUtils ISO convention). */
export interface OperatingHourDraft {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

/** PATCH /profile body (manzu-b editProfileSchema). The web always sends the full form. */
export interface UpdateProfileRequest {
  user: { name: string; email: string };
  pharmacy: {
    name: string;
    address: string;
    lga: string;
    state: string;
    ward: string;
    phone: string;
    licenseNumber: string;
    logoUrl: string;
    latitude: number | string;
    longitude: number | string;
    deliveryAvailability: boolean;
  };
}

export interface LogoUploadFile {
  uri: string;
  name: string;
  type: string;
}

export interface LogoUploadResponse {
  message: string;
  logoUrl: string;
}

export interface ChangePinRequest {
  currentPin: string;
  newPin: string;
}
