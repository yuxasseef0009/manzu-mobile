import { z } from 'zod';

import { ASSIGNABLE_ROLES } from '@/lib/roles';

const pinRule = /^\d{6}$/;

// manzu-b addUserSchema / editUserSchema; PIN optional when editing (blank = keep current).
export function staffFormSchema(mode: 'create' | 'edit') {
  return z.object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().trim().email('Invalid email address'),
    pin:
      mode === 'create'
        ? z.string().length(6, 'PIN must be exactly 6 digits').regex(pinRule, 'PIN must contain only numbers')
        : z.string().refine((v) => v === '' || pinRule.test(v), 'PIN must be exactly 6 digits'),
    role: z.enum(ASSIGNABLE_ROLES),
  });
}

export type StaffFormValues = z.infer<ReturnType<typeof staffFormSchema>>;
