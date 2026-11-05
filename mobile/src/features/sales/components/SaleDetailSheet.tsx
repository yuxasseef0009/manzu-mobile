import { LinearGradient } from 'expo-linear-gradient';
import { Banknote, Calendar, CreditCard, FileText, Package, Receipt } from 'lucide-react-native';
import { Share, StyleSheet, View } from 'react-native';

import { Button, Sheet, Text } from '@/components/ui';
import { useSession } from '@/features/auth/store';
import { formatNairaShort } from '@/lib/format';
import { colors, gradients, radius } from '@/theme';

import type { Sale } from '../types';
import { itemCount, receiptText, saleItems } from '../utils';

// sales-history/page.jsx SaleDetailsModal, built from the list row (GET /sales/:saleId has no route, PLAN.md B7).
export function SaleDetailSheet({ sale, onClose }: { sale: Sale | null; onClose: () => void }) {
  const pharmacyName = useSession((s) => s.pharmacy?.name);
  if (!sale) return null;
  const items = saleItems(sale);
  const MethodIcon = sale.paymentMethod === 'CASH' ? Banknote : CreditCard;

  return (
    <Sheet visible onClose={onClose}>
      <LinearGradient colors={gradients.brandText} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <Receipt size={22} color={colors.white} />
        <View>
          <Text size="lg" weight="bold" color={colors.white}>
            Sale Details
          </Text>
          <Text size="xs" color="rgba(255,255,255,0.8)">
            Transaction #{sale.id}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.infoRow}>
        <View style={styles.info}>
          <View style={styles.row}>
            <Calendar size={14} color={colors.gray600} />
            <Text size="xs" color={colors.gray600}>
              Date & Time
            </Text>
          </View>
          <Text weight="semibold" color={colors.gray900}>
            {new Date(sale.createdAt).toLocaleString()}
          </Text>
        </View>
        <View style={styles.info}>
          <View style={styles.row}>
            <MethodIcon size={14} color={colors.gray600} />
            <Text size="xs" color={colors.gray600}>
              Payment Method
            </Text>
          </View>
          <Text weight="semibold" color={colors.gray900}>
            {sale.paymentMethod}
          </Text>
        </View>
      </View>

      <View style={styles.items}>
        <View style={styles.row}>
          <Package size={16} color={colors.brandBlue} />
          <Text weight="semibold" color={colors.gray900}>
            Items Sold
          </Text>
        </View>
        {items.length === 0 ? (
          <Text size="xs" color={colors.gray500}>
            No item details were saved for this sale.
          </Text>
        ) : (
          items.map((item, idx) => (
            <View key={`${item.medicationId}-${idx}`} style={styles.line}>
              <View style={styles.flex}>
                <Text weight="medium" color={colors.gray900} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text size="xs" color={colors.gray600}>
                  Qty: {item.quantity} × {formatNairaShort(item.price)}
                </Text>
              </View>
              <Text weight="semibold" color={colors.gray900}>
                {formatNairaShort(item.quantity * item.price)}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.total}>
        <Text size="base" weight="semibold" color={colors.gray900}>
          Total Amount
        </Text>
        <Text size="2xl" weight="bold" color={colors.primary}>
          {formatNairaShort(sale.total)}
        </Text>
      </View>

      <View style={styles.summary}>
        <SummaryCell label="Items" value={String(itemCount(items))} bg={colors.blue50} fg={colors.blue600} />
        <SummaryCell label="Revenue" value={formatNairaShort(sale.total)} bg={colors.green50} fg={colors.green600} />
        <SummaryCell label="Products" value={String(items.length)} bg={colors.purple50} fg={colors.purple600} />
      </View>

      <View style={styles.actions}>
        <Button
          title="Share Receipt"
          icon={FileText}
          style={[styles.flex, { backgroundColor: colors.brandBlue }]}
          onPress={() => void Share.share({ title: `Receipt #${sale.id}`, message: receiptText({ ...sale, items }, pharmacyName) })}
        />
        <Button title="Close" variant="secondary" style={styles.flex} onPress={onClose} />
      </View>
    </Sheet>
  );
}

function SummaryCell({ label, value, bg, fg }: { label: string; value: string; bg: string; fg: string }) {
  return (
    <View style={[styles.cell, { backgroundColor: bg }]}>
      <Text size="xs" color={colors.gray600}>
        {label}
      </Text>
      <Text size="base" weight="bold" color={fg} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderRadius: radius.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoRow: { gap: 8 },
  info: { gap: 4, padding: 12, borderRadius: radius.lg, backgroundColor: colors.gray50 },
  items: { gap: 8 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: radius.lg, backgroundColor: colors.gray50 },
  total: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 2, borderTopColor: colors.gray200 },
  summary: { flexDirection: 'row', gap: 8 },
  cell: { flex: 1, alignItems: 'center', gap: 2, padding: 8, borderRadius: radius.lg },
  actions: { flexDirection: 'row', gap: 12 },
});
