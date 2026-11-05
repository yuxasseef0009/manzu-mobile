import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, Clock, Package, Receipt, Share2 } from 'lucide-react-native';
import { Share, StyleSheet, View } from 'react-native';

import { Button, Sheet, Text } from '@/components/ui';
import { useSession } from '@/features/auth/store';
import { receiptText } from '@/features/sales/utils';
import { formatNairaShort } from '@/lib/format';
import { colors, gradients, radius } from '@/theme';

import type { CompletedSale } from '../types';

// pos/new-sale ReceiptModal. "Print Receipt" becomes the native share sheet.
export function ReceiptSheet({ sale, onClose }: { sale: CompletedSale | null; onClose: () => void }) {
  const pharmacyName = useSession((s) => s.pharmacy?.name);
  if (!sale) return null;
  return (
    <Sheet visible onClose={onClose}>
      <LinearGradient colors={gradients.brandText} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <View style={styles.row}>
          <Receipt size={22} color={colors.white} />
          <Text size="lg" weight="bold" color={colors.white}>
            Sale Receipt
          </Text>
        </View>
        <View style={styles.row}>
          <Clock size={14} color="rgba(255,255,255,0.9)" />
          <Text size="xs" color="rgba(255,255,255,0.9)">
            {new Date(sale.createdAt).toLocaleString()}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.id}>
        <Text size="xs" color={colors.gray600}>
          Transaction ID
        </Text>
        <Text size="2xl" weight="bold" color={colors.gray900}>
          #{sale.id}
        </Text>
      </View>

      <View style={styles.items}>
        <View style={styles.row}>
          <Package size={14} color={colors.gray900} />
          <Text weight="semibold" color={colors.gray900}>
            Items Sold
          </Text>
        </View>
        {sale.items.map((item, idx) => (
          <View key={`${item.medicationId}-${idx}`} style={styles.line}>
            <View style={styles.flex}>
              <Text weight="medium" color={colors.gray900} numberOfLines={1}>
                {item.name}
              </Text>
              <Text size="xs" color={colors.gray500}>
                {item.quantity} × {formatNairaShort(item.price)}
              </Text>
            </View>
            <Text weight="semibold" color={colors.gray900}>
              {formatNairaShort(item.quantity * item.price)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.total}>
        <Text size="base" weight="semibold" color={colors.gray900}>
          Total
        </Text>
        <Text size="xl" weight="bold" color={colors.primary}>
          {formatNairaShort(sale.total)}
        </Text>
      </View>

      <View style={styles.method}>
        <Text size="xs" color={colors.gray600}>
          Payment Method
        </Text>
        <Text weight="semibold" color={colors.gray900}>
          {sale.paymentMethod.toUpperCase()}
        </Text>
      </View>

      <View style={styles.success}>
        <CheckCircle size={18} color={colors.green600} />
        <Text size="xs" weight="medium" color={colors.green800}>
          Sale completed successfully!
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Share Receipt"
          icon={Share2}
          variant="default"
          style={[styles.flex, { backgroundColor: colors.brandBlue }]}
          onPress={() => void Share.share({ title: `Receipt #${sale.id}`, message: receiptText(sale, pharmacyName) })}
        />
        <Button title="Close" variant="secondary" style={styles.flex} onPress={onClose} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { gap: 8, padding: 16, borderRadius: radius.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  id: { alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.gray200 },
  items: { gap: 10 },
  line: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  total: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 2, borderTopColor: colors.gray200 },
  method: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: radius.lg, backgroundColor: colors.gray50 },
  success: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.green200, backgroundColor: colors.green50 },
  actions: { flexDirection: 'row', gap: 12 },
});
