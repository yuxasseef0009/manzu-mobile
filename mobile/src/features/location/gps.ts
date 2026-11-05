import { isWithinNigeria } from '@/lib/nigeria';

// Constants from manzu-f hooks/usePharmacyGPSCapture.js.
export const GPS_CONFIG = {
  networkSamples: 2,
  gpsSamples: 5,
  minValidSamples: 3,
  networkTimeoutMs: 8_000,
  gpsTimeoutMs: 20_000,
  maxAcceptedAccuracy: 1000,
} as const;

export type GpsQuality = 'excellent' | 'good' | 'acceptable' | 'usable' | 'poor';

export function accuracyQuality(accuracy: number): GpsQuality {
  if (accuracy < 30) return 'excellent';
  if (accuracy < 80) return 'good';
  if (accuracy < 200) return 'acceptable';
  if (accuracy < 500) return 'usable';
  return 'poor';
}

export const QUALITY_LABEL: Record<GpsQuality, string> = {
  excellent: 'Excellent',
  good: 'Good',
  acceptable: 'Acceptable',
  usable: 'Usable',
  poor: 'Poor',
};

export interface GpsSample {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface GpsFix extends GpsSample {
  quality: GpsQuality;
  sampleCount: number;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? (sorted[mid] ?? 0) : ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
}

/** Haversine distance in metres. */
export function distanceMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function isUsableSample(s: GpsSample): boolean {
  return Number.isFinite(s.latitude) && Number.isFinite(s.longitude) && s.accuracy > 0 && s.accuracy <= GPS_CONFIG.maxAcceptedAccuracy && isWithinNigeria(s.latitude, s.longitude);
}

/** Median position after dropping samples far outside the cluster (web outlier filter). */
export function combineSamples(samples: GpsSample[]): GpsFix | null {
  if (samples.length === 0) return null;
  const centre = { latitude: median(samples.map((s) => s.latitude)), longitude: median(samples.map((s) => s.longitude)) };
  const tolerance = Math.max(50, 2 * median(samples.map((s) => s.accuracy)));
  const kept = samples.filter((s) => distanceMeters(s, centre) <= tolerance);
  const used = kept.length >= Math.min(GPS_CONFIG.minValidSamples, samples.length) ? kept : samples;
  const accuracy = median(used.map((s) => s.accuracy));
  return {
    latitude: median(used.map((s) => s.latitude)),
    longitude: median(used.map((s) => s.longitude)),
    accuracy,
    quality: accuracyQuality(accuracy),
    sampleCount: used.length,
  };
}
