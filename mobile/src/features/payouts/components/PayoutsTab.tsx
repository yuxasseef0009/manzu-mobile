import { Activity, Calendar, Package, Wallet } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Badge, Button, Card, EmptyState, ErrorState, Skeleton, Text, type BadgeVariant } from '@/components/ui';
import { formatNairaShort } from '@/lib/format';
import { colors, radius } from '@/theme';

import { usePayoutHistory, usePendingPayoutOrders } from '../hooks';
import type { Payout, PayoutStatus, PendingPayoutOrder } from '../types';

const STATUS_VARIANT: Record<PayoutStatus, BadgeVariant> = { COMPLETED: 'success', PROCESSING: 'info', PENDING: 'warning', FAILED: 'destructive' };
const STATUS_LABEL: Record<PayoutStatus, string> = { COMPLETED: 'Completed', PROCESSING: 'Processing', PENDING: 'Pending', FAILED: 'Failed' };

const shortDate = (v: string) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function PendingOrderRow({ order }: { order: PendingPayoutOrder }) {
  const fee = order.platformFee && order.totalPrice ? `(${((order.platformFee / order.totalPrice) * 100).toFixed(1)}% fee)` : '';
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Package size={16} color={colors.orange600} />
      </View>
      <View style={styles.flex}>
        <Text weight="semibold" color={colors.gray900}>
          Order #{order.id}
        </Text>
        <Text size="xs" color={colors.gray500}>
          {new Date(order.filledAt || order.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.right}>
        <Text weight="bold" color={colors.green600}>
          {formatNairaShort(order.pharmacyAmount || 0)}
        </Text>
        {fee ? (
          <Text size="xs" color={colors.gray500}>
            {fee}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function PendingOrdersCard() {
  const pending = usePendingPayoutOrders();
  const orders = pending.data?.orders ?? [];
  if (pending.isError) return <ErrorState error={pending.error} title="Failed to load orders awaiting payout" onRetry={() => void pending.refetch()} />;
  if (pending.isPending) return <Skeleton height={140} style={styles.skeleton} />;
  if (orders.length === 0) return null;
  const total = orders.reduce((s, o) => s + (o.pharmacyAmount || 0), 0);
  return (
    <Card style={styles.card}>
      <View style={styles.inline}>
        <Package size={18} color={colors.orange600} />
        <Text size="base" weight="semibold" color={colors.gray900}>
          Orders Awaiting Payout
        </Text>
      </View>
      <View style={styles.pendingSummary}>
        <View style={styles.flex}>
          <Text color={colors.gray700}>
            <Text weight="bold" color={colors.orange600}>
              {orders.length}
            </Text>{' '}
            completed order{orders.length > 1 ? 's' : ''} ready for payout
          </Text>
          <Text size="xs" color={colors.gray500}>
            {"Will be processed in tonight's batch (11 PM)"}
          </Text>
        </View>
        <Text size="xl" weight="bold" color={colors.orange600}>
          {formatNairaShort(total)}
        </Text>
      </View>
      {orders.slice(0, 5).map((o) => (
        <PendingOrderRow key={o.id} order={o} />
      ))}
      {orders.length > 5 ? (
        <Text size="xs" color={colors.gray500} align="center">
          + {orders.length - 5} more orders
        </Text>
      ) : null}
    </Card>
  );
}

function PayoutRow({ payout }: { payout: Payout }) {
  const count = payout.orderIds?.length ?? 0;
  return (
    <View style={styles.payout}>
      <View style={styles.flex}>
        <View style={styles.inline}>
          <Text weight="semibold" color={colors.gray900}>
            #{payout.reference.split('_').pop()}
          </Text>
          <Badge label={STATUS_LABEL[payout.status] ?? payout.status} variant={STATUS_VARIANT[payout.status] ?? 'warning'} />
        </View>
        <View style={styles.meta}>
          <View style={styles.inline}>
            <Calendar size={12} color={colors.gray500} />
            <Text size="xs" color={colors.gray500}>
              {shortDate(payout.initiatedAt)}
            </Text>
          </View>
          <View style={styles.inline}>
            <Package size={12} color={colors.gray500} />
            <Text size="xs" color={colors.gray500}>
              {count} order{count !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.right}>
        <Text size="base" weight="bold" color={colors.gray900}>
          {formatNairaShort(payout.amount)}
        </Text>
        {payout.completedAt ? (
          <Text size="xs" color={colors.green600}>
            Received {new Date(payout.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function PayoutHistoryCard() {
  const history = usePayoutHistory();
  const payouts = history.data?.pages.flatMap((p) => p.payouts) ?? [];
  const total = history.data?.pages[0]?.pagination.total ?? 0;
  return (
    <Card style={styles.card}>
      <View style={styles.inline}>
        <Activity size={18} color={colors.brandBlue} />
        <Text size="base" weight="semibold" color={colors.gray900}>
          Payout History
        </Text>
      </View>
      {history.isPending ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : history.isError ? (
        <ErrorState error={history.error} title="Failed to load payout history" onRetry={() => void history.refetch()} />
      ) : payouts.length === 0 ? (
        <EmptyState icon={Wallet} title="No payout history yet" description="Complete orders will be paid out daily" />
      ) : (
        <>
          {payouts.map((p) => (
            <PayoutRow key={p.id} payout={p} />
          ))}
          {history.hasNextPage ? (
            <Button title="Load more" variant="outline" loading={history.isFetchingNextPage} loadingTitle="Loading..." onPress={() => void history.fetchNextPage()} />
          ) : (
            <Text size="xs" color={colors.gray500} align="center">
              {total} payout{total !== 1 ? 's' : ''}
            </Text>
          )}
        </>
      )}
    </Card>
  );
}

export function PayoutsTab() {
  return (
    <View style={styles.container}>
      <PendingOrdersCard />
      <PayoutHistoryCard />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  container: { gap: 16 },
  card: { padding: 16, gap: 12 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  skeleton: { borderRadius: radius['2xl'] },
  loader: { paddingVertical: 24 },
  pendingSummary: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.lg, backgroundColor: colors.orange50, borderWidth: 1, borderColor: colors.orange200 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.lg, backgroundColor: colors.gray50 },
  rowIcon: { padding: 8, borderRadius: radius.lg, backgroundColor: colors.orange100 },
  right: { alignItems: 'flex-end', gap: 2 },
  payout: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.gray200 },
  meta: { flexDirection: 'row', gap: 12, marginTop: 4 },
});
