import STATE_LGA_MAP from '@/data/stateLga.json';

// Same file as manzu-f public/data/stateLga.json and manzu-b data/stateLga.json (utils/location.js validates against it).
const MAP = STATE_LGA_MAP as Record<string, string[]>;

export const NIGERIAN_STATES: string[] = Object.keys(MAP);

export function lgasForState(state: string): string[] {
  return MAP[state] ?? [];
}

export function isValidStateLga(state: string, lga: string): boolean {
  return lgasForState(state).includes(lga);
}

// Backend registerSchema / validateLocation bounds.
export const NIGERIA_LAT = { min: 4, max: 14 } as const;
export const NIGERIA_LNG = { min: 3, max: 15 } as const;

export function isWithinNigeria(lat: number, lng: number): boolean {
  return lat >= NIGERIA_LAT.min && lat <= NIGERIA_LAT.max && lng >= NIGERIA_LNG.min && lng <= NIGERIA_LNG.max;
}
