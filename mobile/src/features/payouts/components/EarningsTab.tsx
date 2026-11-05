import { CheckCircle, Clock, DollarSign, Package, Wallet } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, ChipGroup, ErrorState, Skeleton, Text } from '@/components/ui';
import { formatNairaShort } from '@/lib/format';
import { colors, radius } from '@/theme';

import { useEarnings } from '../hooks';
import type { EarningsPeriod } from '../types';
import { MetricTile } from './PayoutMetricCards';

const PERIODS: { value: EarningsPeriod; label: string }[] = [
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last Month' },
  { value: 'year', label: 'Last Year' },
];

// GET /earnings/analytics?period. The web defines this call but never renders it; the plan's Earnings tab does.
export function EarningsTab() {
  const [period, setPeriod] = useState<EarningsPeriod>('week');
  const earnings = useEarnings(period);
  const data = earnings.data;

  return (
    <View style={styles.container}>
      <ChipGroup options={PERIODS} value={period} onChange={setPeriod} />
      {data ? (
        <View style={styles.grid}>
          <MetricTile icon={DollarSign} label="Total Earnings" value={formatNairaShort(Math.round(data.totalEarnings))} color={colors.primary} subtitle={`${data.orderCount} completed order${data.orderCount !== 1 ? 's' : ''}`} />
          <MetricTile icon={CheckCircle} label="Paid Out" value={formatNairaShort(Math.round(data.totalPaid))} color={colors.brandBlue} subtitle={`${data.payoutCount} payout${data.payoutCount !== 1 ? 's' : ''}`} />
          <MetricTile icon={Clock} label="Awaiting Payout" value={formatNairaShort(Math.round(Math.max(0, data.pendingPayout)))} color={colors.brandOrange} subtitle="Earnings not yet paid" />
          <MetricTile icon={Package} label="Orders" value={data.orderCount} color={colors.brandPurple} subtitle="Completed in period" />
        </View>
      ) : earnings.isError ? (
        <ErrorState error={earnings.error} title="Failed to load earnings" onRetry={() => void earnings.refetch()} />
      ) : (
        <View style={styles.grid}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={120} style={styles.skeleton} />
          ))}
        </View>
      )}
      <Text size="xs" color={colors.gray500}>
        Earnings count completed orders by their fill date, so some completed orders may not be included yet.
      </Text>

      <Card style={styles.commission}>
        <Wallet size={20} color={colors.brandBlue} />
        <Text size="sm" color={colors.gray700} style={styles.flex}>
          <Text size="sm" weight="semibold" color={colors.gray900}>
            Commission Structure:
          </Text>{' '}
          Platform takes a flat 8% commission on all orders. You keep 92% of every sale.
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  skeleton: { flexBasis: '47%', flexGrow: 1, borderRadius: radius.lg },
  commission: { flexDirection: 'row', gap: 12, padding: 16, backgroundColor: colors.blue50, borderColor: colors.blue200 },
});
