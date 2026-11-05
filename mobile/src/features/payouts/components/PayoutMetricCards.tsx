import { Activity, CheckCircle, Clock, XCircle, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Skeleton, Text } from '@/components/ui';
import { formatNairaShort } from '@/lib/format';
import { colors, radius, shadows } from '@/theme';

import type { PayoutSummaryResponse } from '../types';

export function MetricTile({ icon: Icon, label, value, color, subtitle }: { icon: LucideIcon; label: string; value: string | number; color: string; subtitle?: string }) {
  return (
    <View style={[styles.tile, shadows.sm]}>
      <View style={[styles.icon, { backgroundColor: `${color}20` }]}>
        <Icon size={18} color={color} />
      </View>
      <Text size="xl" weight="bold" color={colors.gray900} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text size="xs" weight="medium" color={colors.gray600}>
        {label}
      </Text>
      {subtitle ? (
        <Text size="xs" color={colors.gray500}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

// payment/page.jsx summary cards. PROCESSING payouts may never complete (no payout webhook, OQ B1): shown as-is.
export function PayoutMetricCards({ summary }: { summary: PayoutSummaryResponse | undefined }) {
  if (!summary) {
    return (
      <View style={styles.grid}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} height={120} style={styles.skeleton} />
        ))}
      </View>
    );
  }
  return (
    <View style={styles.grid}>
      <MetricTile icon={Clock} label="Pending Payout" value={formatNairaShort(summary.pending.amount)} color={colors.brandOrange} subtitle={`${summary.pending.count} completed orders`} />
      <MetricTile icon={Activity} label="Processing" value={formatNairaShort(summary.processing.amount)} color={colors.brandBlue} subtitle={`${summary.processing.count} in progress`} />
      <MetricTile icon={CheckCircle} label="Total Paid" value={formatNairaShort(summary.completed.amount)} color={colors.primary} subtitle={`${summary.completed.count} payouts`} />
      <MetricTile icon={XCircle} label="Failed" value={formatNairaShort(summary.failed.amount)} color={colors.brandRed} subtitle={`${summary.failed.count} failed`} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { flexBasis: '47%', flexGrow: 1, padding: 14, gap: 2, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.gray200 },
  icon: { alignSelf: 'flex-start', padding: 8, borderRadius: radius.lg, marginBottom: 6 },
  skeleton: { flexBasis: '47%', flexGrow: 1, borderRadius: radius.lg },
});
