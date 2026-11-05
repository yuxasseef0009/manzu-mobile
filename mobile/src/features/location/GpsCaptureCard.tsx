import { CheckCircle2, Crosshair, MapPin, RefreshCw, TriangleAlert } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { colors, radius } from '@/theme';

import { QUALITY_LABEL, type GpsQuality } from './gps';
import type { useGpsCapture } from './useGpsCapture';

const QUALITY_COLOR: Record<GpsQuality, string> = {
  excellent: colors.green700,
  good: colors.green600,
  acceptable: colors.yellow700,
  usable: colors.orange600,
  poor: colors.red600,
};

interface Props {
  gps: ReturnType<typeof useGpsCapture>;
  disabled?: boolean;
  /** Label for the idle capture button. */
  actionTitle?: string;
}

// Condensed PharmacyGPSCaptureUI.jsx: progress, accuracy band, sample count, retry.
export function GpsCaptureCard({ gps, disabled, actionTitle = 'Capture Pharmacy Location' }: Props) {
  const { status, samples, totalSamples, fix, error, capturing } = gps;
  const progress = Math.round((samples / totalSamples) * 100);

  return (
    <View style={styles.card} accessibilityLiveRegion="polite">
      {status === 'idle' ? (
        <>
          <View style={styles.row}>
            <MapPin size={18} color={colors.brandBlue} />
            <Text weight="semibold" color={colors.gray900} style={styles.flex}>
              Pharmacy GPS location
            </Text>
          </View>
          <Text size="xs" color={colors.gray600}>
            Stand inside or at the entrance of your pharmacy. We take several readings (about 30 seconds) for an accurate pin.
          </Text>
          <Button title={actionTitle} icon={Crosshair} variant="gradient" fullWidth disabled={disabled} onPress={() => void gps.capture()} />
        </>
      ) : null}

      {capturing ? (
        <>
          <View style={styles.row}>
            <ActivityIndicator color={colors.primary} />
            <Text weight="semibold" color={colors.gray900} style={styles.flex}>
              {status === 'requesting' ? 'Requesting location permission…' : status === 'network' ? 'Getting approximate location…' : 'Refining with GPS…'}
            </Text>
          </View>
          <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: progress }}>
            <View style={[styles.bar, { width: `${progress}%` }]} />
          </View>
          <Text size="xs" color={colors.gray600}>
            Reading {Math.min(samples + 1, totalSamples)} of {totalSamples}
            {fix ? ` · current accuracy ±${Math.round(fix.accuracy)}m` : ''}
          </Text>
          <Button title="Cancel" variant="ghost" fullWidth onPress={gps.reset} />
        </>
      ) : null}

      {status === 'done' && fix ? (
        <>
          <View style={styles.row}>
            <CheckCircle2 size={18} color={colors.green600} />
            <Text weight="semibold" color={colors.green800} style={styles.flex}>
              Location captured
            </Text>
            <Text size="xs" weight="semibold" color={QUALITY_COLOR[fix.quality]}>
              {QUALITY_LABEL[fix.quality]} · ±{Math.round(fix.accuracy)}m
            </Text>
          </View>
          <Text size="xs" color={colors.gray600}>
            {fix.latitude.toFixed(6)}, {fix.longitude.toFixed(6)} · {fix.sampleCount} readings
          </Text>
          {fix.quality === 'usable' || fix.quality === 'poor' ? (
            <Text size="xs" color={colors.orange600}>
              Accuracy is low. Move closer to a window or outdoors and recapture for a better pin.
            </Text>
          ) : null}
          <Button title="Recapture" icon={RefreshCw} variant="outline" fullWidth disabled={disabled} onPress={() => void gps.capture()} />
        </>
      ) : null}

      {status === 'error' ? (
        <>
          <View style={styles.row}>
            <TriangleAlert size={18} color={colors.red600} />
            <Text weight="semibold" color={colors.red700} style={styles.flex}>
              {"Couldn't capture location"}
            </Text>
          </View>
          <Text size="xs" color={colors.red700}>
            {error}
          </Text>
          <Button title="Try Again" icon={RefreshCw} variant="outline" fullWidth disabled={disabled} onPress={() => void gps.capture()} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { gap: 10, padding: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.gray200, backgroundColor: colors.gray50 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.gray200, overflow: 'hidden' },
  bar: { height: 6, backgroundColor: colors.primary },
});
