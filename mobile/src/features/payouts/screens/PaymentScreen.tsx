import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChipGroup, Screen, Text } from '@/components/ui';
import { colors, radius } from '@/theme';

import { payoutKeys, payoutSummaryQueryOptions } from '../api';
import { BankTab } from '../components/BankTab';
import { EarningsTab } from '../components/EarningsTab';
import { PayoutMetricCards } from '../components/PayoutMetricCards';
import { PayoutsTab } from '../components/PayoutsTab';
import { useBankingStatus } from '../hooks';

type Tab = 'earnings' | 'payouts' | 'bank';
const TABS: { value: Tab; label: string }[] = [
  { value: 'earnings', label: 'Earnings' },
  { value: 'payouts', label: 'Payouts' },
  { value: 'bank', label: 'Bank' },
];

// (dashboard)/payment/page.jsx split into Earnings · Payouts · Bank tabs.
export function PaymentScreen() {
  const queryClient = useQueryClient();
  const summary = useQuery(payoutSummaryQueryOptions);
  const banking = useBankingStatus();
  const [tab, setTab] = useState<Tab>('earnings');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.refetchQueries({ queryKey: payoutKeys.all, type: 'active' });
    setRefreshing(false);
  }, [queryClient]);

  return (
    <Screen edges={['bottom']} refreshing={refreshing} onRefresh={onRefresh} dataUpdatedAt={summary.dataUpdatedAt || undefined}>
      <View>
        <Text size="2xl" weight="bold" color={colors.gray900}>
          Payment & Payouts
        </Text>
        <Text color={colors.gray600}>Manage your bank account and track earnings</Text>
      </View>

      {banking.data && !banking.data.hasSetup ? (
        <View style={styles.alert} accessibilityRole="alert">
          <AlertCircle size={20} color={colors.yellow700} />
          <View style={styles.flex}>
            <Text weight="semibold" color={colors.yellow900}>
              Banking Setup Required
            </Text>
            <Text size="xs" color={colors.yellow800}>
              Configure your bank account in the Bank tab to start receiving payouts
            </Text>
          </View>
        </View>
      ) : null}

      <PayoutMetricCards summary={summary.data} />

      <ChipGroup options={TABS} value={tab} onChange={setTab} segmented />

      {tab === 'earnings' ? <EarningsTab /> : tab === 'payouts' ? <PayoutsTab /> : <BankTab />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  alert: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: radius.lg, backgroundColor: colors.yellow100, borderWidth: 1, borderColor: colors.yellow300 },
});
