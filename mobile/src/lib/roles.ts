// Backend authorizeRoles('MANAGER') compares req.user.role === 'MANAGER'.
export function isManager(role: string | null | undefined): boolean {
  return role === 'MANAGER';
}

/** PLAN D3: managers may only assign these roles from mobile (backend addUserSchema accepts any role). */
export const ASSIGNABLE_ROLES = ['PHARMACIST', 'STAFF', 'TECHNICIAN'] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export function roleLabel(role: string | null | undefined): string {
  if (!role) return '';
  return role.charAt(0) + role.slice(1).toLowerCase();
}
