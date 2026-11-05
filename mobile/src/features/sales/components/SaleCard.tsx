import { Banknote, CreditCard, Eye, Receipt } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { formatNairaShort, formatShortDateTime } from '@/lib/format';
import { colors, radius, shadows } from '@/theme';

import type { Sale } from '../types';
import { itemCount, saleItems } from '../utils';

// sales-history/page.jsx renderMobileCard.
export const SaleCard = memo(function SaleCard({ sale, onOpen }: { sale: Sale; onOpen: (sale: Sale) => void }) {
  const items = saleItems(sale);
  const cash = sale.paymentMethod === 'CASH';
  return (
    <Pressable
      onPress={() => onOpen(sale)}
      accessibilityRole="button"
      accessibilityLabel={`Sale ${sale.id}, ${formatNairaShort(sale.total)}, ${sale.paymentMethod}`}
      style={({ pressed }) => [styles.card, shadows.sm, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <View style={styles.flex}>
          <View style={styles.row}>
            <Receipt size={14} color={colors.brandBlue} />
            <Text weight="semibold" color={colors.gray900}>
              #{sale.id}
            </Text>
          </View>
          <Text size="xs" color={colors.gray600}>
            {formatShortDateTime(sale.createdAt)}
          </Text>
        </View>
        <Eye size={18} color={colors.primary} />
      </View>

      <View style={styles.grid}>
        <View style={styles.flex}>
          <Text size="xs" color={colors.gray500}>
            Items
          </Text>
          <Text weight="semibold" color={colors.gray900}>
            {itemCount(items)}
          </Text>
        </View>
        <View style={styles.flex}>
          <Text size="xs" color={colors.gray500}>
            Products
          </Text>
          <Text weight="semibold" color={colors.gray900}>
            {items.length}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.row}>
          {cash ? <Banknote size={14} color={colors.green600} /> : <CreditCard size={14} color={colors.blue600} />}
          <Text size="xs" weight="medium" color={colors.gray700}>
            {sale.paymentMethod}
          </Text>
        </View>
        <Text size="lg" weight="bold" color={colors.primary}>
          {formatNairaShort(sale.total)}
        </Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  card: { gap: 8, padding: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.lg },
  pressed: { opacity: 0.85 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  grid: { flexDirection: 'row', gap: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.gray100 },
});
