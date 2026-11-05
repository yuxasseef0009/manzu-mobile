import type { OperatingHourDraft, OperatingHourSlot, ProfileResponse, UpdateProfileRequest } from './types';

/** Web DAYS_OF_WEEK order: index = dayOfWeek (0 = Monday … 6 = Sunday). */
export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

const JS_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function formatTo12Hour(time: string | null | undefined): string | null {
  if (!time) return null;
  const hhmm = time.includes('T') ? time.slice(11, 16) : time;
  const [h = '0', m = '0'] = hhmm.split(':');
  const hour24 = parseInt(h, 10);
  const minute = parseInt(m, 10);
  const hour = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour}:${minute.toString().padStart(2, '0')} ${hour24 >= 12 ? 'PM' : 'AM'}`;
}

export interface OperatingStatus {
  text: string;
  status: 'open' | 'closed';
}

// Port of manzu-f lib/pharmacyUtils.js formatOperatingHours.
export function formatOperatingHours(hours: OperatingHourSlot[], now: Date = new Date()): OperatingStatus | null {
  const open = hours.filter((h): h is OperatingHourSlot & { openTime: string; closeTime: string } => !!h.openTime && !!h.closeTime);
  if (open.length === 0) return null;

  const jsDay = now.getDay();
  const today = jsDay === 0 ? 6 : jsDay - 1;
  const currentTime = now.toTimeString().slice(0, 5);
  const displayDay = (isoDay: number) => JS_DAYS[isoDay === 6 ? 0 : isoDay + 1];

  if (open.length === 7 && open.every((h) => h.openTime === '00:00' && h.closeTime === '23:59')) {
    return { text: 'Open 24/7', status: 'open' };
  }

  const nextOpening = (prefix: string): OperatingStatus => {
    for (let i = 1; i <= 7; i++) {
      const nextDay = (today + i) % 7;
      const next = open.find((h) => h.dayOfWeek === nextDay);
      if (next) return { text: `${prefix}, opens ${displayDay(nextDay)} at ${formatTo12Hour(next.openTime)}`, status: 'closed' };
    }
    return { text: prefix, status: 'closed' };
  };

  const todayHours = open.find((h) => h.dayOfWeek === today);
  if (!todayHours) return nextOpening('Closed today');
  if (currentTime >= todayHours.openTime && currentTime < todayHours.closeTime) {
    return { text: `Open now until ${formatTo12Hour(todayHours.closeTime)}`, status: 'open' };
  }
  if (currentTime < todayHours.openTime) return { text: `Closed, opens today at ${formatTo12Hour(todayHours.openTime)}`, status: 'closed' };
  return nextOpening('Closed');
}

/** Same defaults as the web loadOperatingHours: all 7 days, missing days closed, 09:00–17:00 placeholders. */
export function toHoursDraft(slots: OperatingHourSlot[]): OperatingHourDraft[] {
  if (slots.length === 0) {
    return DAYS_OF_WEEK.map((_, dayOfWeek) => ({ dayOfWeek, openTime: '09:00', closeTime: '17:00', isClosed: false }));
  }
  const byDay = new Map(slots.map((s) => [s.dayOfWeek, s]));
  return DAYS_OF_WEEK.map((_, dayOfWeek) => {
    const slot = byDay.get(dayOfWeek);
    if (!slot) return { dayOfWeek, openTime: '09:00', closeTime: '17:00', isClosed: true };
    return { dayOfWeek, openTime: slot.openTime ?? '09:00', closeTime: slot.closeTime ?? '17:00', isClosed: !slot.openTime || !slot.closeTime };
  });
}

/** Returns the first open day whose closing time is not after its opening time. */
export function invalidHoursDay(hours: OperatingHourDraft[]): string | null {
  const bad = hours.find((h) => !h.isClosed && h.closeTime <= h.openTime);
  return bad ? (DAYS_OF_WEEK[bad.dayOfWeek] ?? null) : null;
}

export function parseCoordinate(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

/** Full PATCH /profile body from the loaded profile, as the web sends its whole formData. */
export function buildProfilePayload(profile: ProfileResponse, overrides: { user?: Partial<UpdateProfileRequest['user']>; pharmacy?: Partial<UpdateProfileRequest['pharmacy']> } = {}): UpdateProfileRequest {
  const { user, pharmacy } = profile;
  return {
    user: { name: user.name, email: user.email, ...overrides.user },
    pharmacy: {
      name: pharmacy.name,
      address: pharmacy.address,
      lga: pharmacy.lga,
      state: pharmacy.state,
      ward: pharmacy.ward ?? '',
      phone: pharmacy.phone,
      licenseNumber: pharmacy.licenseNumber,
      logoUrl: pharmacy.logoUrl ?? '',
      latitude: pharmacy.latitude ?? '',
      longitude: pharmacy.longitude ?? '',
      deliveryAvailability: pharmacy.deliveryAvailability ?? false,
      ...overrides.pharmacy,
    },
  };
}
