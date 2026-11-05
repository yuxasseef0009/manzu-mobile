import type { PharmacyUserRole } from '@/features/auth/types';
import type { AssignableRole } from '@/lib/roles';

// GET /api/pharmacy/users → pharmacy-users.repository select { id, name, email, role }.
export interface StaffUser {
  id: number;
  name: string;
  email: string;
  role: PharmacyUserRole;
}

export interface StaffListResponse {
  message: string;
  users: StaffUser[];
}

export interface AddStaffRequest {
  name: string;
  email: string;
  pin: string;
  role: AssignableRole;
}

/** PATCH /api/auth/users/:id only forwards { name, email, pin } (role edits are dropped server-side, G9). */
export interface EditStaffRequest {
  name: string;
  email: string;
  pin?: string;
}

export interface StaffMutationResponse {
  message: string;
  user: StaffUser;
}
