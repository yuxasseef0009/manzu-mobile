import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

import { isWithinNigeria } from '@/lib/nigeria';

import { combineSamples, GPS_CONFIG, isUsableSample, type GpsFix, type GpsSample } from './gps';

export type GpsStatus = 'idle' | 'requesting' | 'network' | 'gps' | 'done' | 'error';

export interface GpsCaptureState {
  status: GpsStatus;
  samples: number;
  totalSamples: number;
  fix: GpsFix | null;
  error: string | null;
}

const TOTAL = GPS_CONFIG.networkSamples + GPS_CONFIG.gpsSamples;
const INITIAL: GpsCaptureState = { status: 'idle', samples: 0, totalSamples: TOTAL, fix: null, error: null };

class TimeoutError extends Error {}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new TimeoutError('timeout')), ms);
    promise.then(
      (v) => {
        clearTimeout(id);
        resolve(v);
      },
      (e: unknown) => {
        clearTimeout(id);
        reject(e instanceof Error ? e : new Error(String(e)));
      },
    );
  });
}

// Mobile port of usePharmacyGPSCapture: quick network-grade fixes, then high-accuracy GPS fixes, median of the valid ones.
export function useGpsCapture() {
  const [state, setState] = useState<GpsCaptureState>(INITIAL);
  const runId = useRef(0);

  useEffect(
    () => () => {
      runId.current++;
    },
    [],
  );

  const capture = useCallback(async () => {
    const id = ++runId.current;
    const alive = () => runId.current === id;
    setState({ ...INITIAL, status: 'requesting' });

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!alive()) return;
      if (!permission.granted) {
        setState({ ...INITIAL, status: 'error', error: 'Location permission denied. Enable location access for Manzu in your device settings.' });
        return;
      }
      if (!(await Location.hasServicesEnabledAsync())) {
        if (!alive()) return;
        setState({ ...INITIAL, status: 'error', error: 'Location services are turned off. Turn on GPS and try again.' });
        return;
      }

      const valid: GpsSample[] = [];
      let taken = 0;
      let outsideNigeria = false;
      const phases = [
        { status: 'network' as const, count: GPS_CONFIG.networkSamples, accuracy: Location.Accuracy.Balanced, timeout: GPS_CONFIG.networkTimeoutMs },
        { status: 'gps' as const, count: GPS_CONFIG.gpsSamples, accuracy: Location.Accuracy.Highest, timeout: GPS_CONFIG.gpsTimeoutMs },
      ];

      for (const phase of phases) {
        for (let i = 0; i < phase.count; i++) {
          if (!alive()) return;
          setState((s) => ({ ...s, status: phase.status, samples: taken, fix: combineSamples(valid) }));
          try {
            const pos = await withTimeout(Location.getCurrentPositionAsync({ accuracy: phase.accuracy }), phase.timeout);
            const sample = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy ?? Number.POSITIVE_INFINITY };
            if (isUsableSample(sample)) valid.push(sample);
            else if (!isWithinNigeria(sample.latitude, sample.longitude)) outsideNigeria = true;
          } catch {
            // Timed-out or failed samples are skipped like the web hook.
          }
          taken++;
        }
      }
      if (!alive()) return;

      const fix = combineSamples(valid);
      if (!fix || valid.length < GPS_CONFIG.minValidSamples) {
        const error = outsideNigeria
          ? 'Your location appears to be outside Nigeria. Registration requires a location within Nigeria.'
          : `Could only get ${valid.length} accurate reading${valid.length === 1 ? '' : 's'} (need ${GPS_CONFIG.minValidSamples}). Move near a window or outdoors and try again.`;
        setState({ status: 'error', samples: taken, totalSamples: TOTAL, fix, error });
        return;
      }
      setState({ status: 'done', samples: taken, totalSamples: TOTAL, fix, error: null });
    } catch (e) {
      if (!alive()) return;
      setState({ ...INITIAL, status: 'error', error: e instanceof Error ? e.message : 'Failed to get location' });
    }
  }, []);

  const reset = useCallback(() => {
    runId.current++;
    setState(INITIAL);
  }, []);

  return { ...state, capturing: state.status === 'requesting' || state.status === 'network' || state.status === 'gps', capture, reset };
}
