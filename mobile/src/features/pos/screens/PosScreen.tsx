import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AlertTriangle, Calculator, CheckCircle, DollarSign, History, Search, ShoppingCart, WifiOff, type LucideIcon } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { toApiError } from '@/api/errors';
import { Button, Screen, Text } from '@/components/ui';
import type { CatalogMedication } from '@/features/inventory/types';
import { formatNairaShort } from '@/lib/format';
import { useIsOnline } from '@/lib/network';
import { colors, radius, shadows } from '@/theme';

import { CartItemRow } from '../components/CartItemRow';
import { MedicationSearch } from '../components/MedicationSearch';
import { PaymentMethodPicker } from '../components/PaymentMethodPicker';
import { ReceiptSheet } from '../components/ReceiptSheet';
import { useRecordSale } from '../hooks';
import { cartItemCount, cartTotal, usePosStore } from '../store';
import type { CartItem, CompletedSale } from '../types';

function Section({ icon: Icon, title, right, children }: { icon: LucideIcon; title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <View style={[styles.card, shadows.sm]}>
      <View style={styles.cardHeader}>
        <Icon size={18} color={colors.brandBlue} />
        <Text size="base" weight="semibold" color={colors.gray900} style={styles.flex}>
          {title}
        </Text>
        {right}
      </View>
      {children}
    </View>
  );
}

/**
 * The backend decrements stock item by item before creating the sale, without a transaction (OQ C11), so a failed
 * sale may already have deducted some stock. Say so instead of retrying.
 */
function saleErrorMessage(err: unknown, cart: CartItem[]): string {
  const e = toApiError(err);
  if (e.status < 500) return e.message || 'Failed to complete sale. Please try again.';
  const reason = e.serverReason ?? '';
  const id = /medication (\d+)/i.exec(reason)?.[1];
  const name = id ? cart.find((i) => i.medicationId === Number(id))?.name : undefined;
  const what = /insufficient stock/i.test(reason)
    ? `Not enough stock for ${name ?? 'an item'}.`
    : /not found in pharmacy inventory/i.test(reason)
      ? `${name ?? 'An item'} is no longer in your inventory.`
      : 'The sale was not recorded.';
  return `${what} Some stock may already have been deducted — check Inventory before trying again.`;
}

// pos/new-sale/page.jsx. Online-only: the sale is never queued (PLAN.md §2).
export function PosScreen() {
  const router = useRouter();
  const online = useIsOnline();
  const { cart, paymentMethod, addItem, setQuantity, removeItem, clearCart, setPaymentMethod, reset } = usePosStore();
  const recordSale = useRecordSale();
  const [error, setError] = useState<string | null>(null);
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);

  const total = cartTotal(cart);
  const processing = recordSale.isPending;

  const add = (med: CatalogMedication) => {
    setError(addItem(med));
  };

  const completeSale = () => {
    if (cart.length === 0 || processing) return;
    setError(null);
    const items = cart.map((i) => ({ medicationId: i.medicationId, quantity: i.quantity, price: i.price, name: i.name }));
    const snapshot = cart;
    recordSale.mutate(
      { items, total, paymentMethod },
      {
        onSuccess: (res) => {
          setCompletedSale({ id: res.sale.id, items, total, paymentMethod, createdAt: res.sale.createdAt ?? new Date().toISOString() });
          reset();
        },
        onError: (err) => setError(saleErrorMessage(err, snapshot)),
      },
    );
  };

  return (
    <Screen>
      <View style={styles.titleRow}>
        <View style={styles.flex}>
          <Text size="2xl" weight="bold" color={colors.brandBlue}>
            Point of Sale
          </Text>
          <Text color={colors.gray600}>Process walk-in customer sales</Text>
        </View>
        <Pressable onPress={() => router.push('/sales-history')} accessibilityRole="button" accessibilityLabel="Sales History" style={styles.historyButton}>
          <History size={18} color={colors.brandBlue} />
          <Text size="xs" weight="semibold" color={colors.brandBlue}>
            History
          </Text>
        </Pressable>
      </View>

      <Section icon={Search} title="Search Medications">
        <MedicationSearch onSelect={add} disabled={processing} />
      </Section>

      <Section
        icon={ShoppingCart}
        title={`Cart (${cart.length})`}
        right={
          cart.length > 0 ? (
            <Pressable onPress={clearCart} disabled={processing} hitSlop={8} accessibilityRole="button" accessibilityLabel="Clear cart">
              <Text size="sm" weight="medium" color={colors.red600}>
                Clear
              </Text>
            </Pressable>
          ) : null
        }
      >
        {cart.length === 0 ? (
          <View style={styles.empty}>
            <ShoppingCart size={48} color={colors.gray300} />
            <Text color={colors.gray500}>Cart is empty</Text>
            <Text size="xs" color={colors.gray400}>
              Search and add medications
            </Text>
          </View>
        ) : (
          <View style={styles.cart}>
            {cart.map((item) => (
              <CartItemRow key={item.medicationId} item={item} onQuantity={setQuantity} onRemove={removeItem} disabled={processing} />
            ))}
          </View>
        )}
      </Section>

      <LinearGradient colors={[colors.blue50, colors.green50]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.summary, shadows.lg]}>
        <View style={styles.cardHeader}>
          <Calculator size={18} color={colors.brandBlue} />
          <Text size="base" weight="semibold" color={colors.gray900}>
            Order Summary
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text color={colors.gray700}>Items</Text>
          <Text weight="semibold" color={colors.gray700}>
            {cartItemCount(cart)}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text size="base" weight="semibold" color={colors.gray900}>
            Total
          </Text>
          <Text size="2xl" weight="bold" color={colors.primary}>
            {formatNairaShort(total)}
          </Text>
        </View>
      </LinearGradient>

      <Section icon={DollarSign} title="Payment Method">
        <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} disabled={processing} />
      </Section>

      {error ? (
        <View style={styles.error} accessibilityRole="alert">
          <AlertTriangle size={18} color={colors.red600} />
          <View style={styles.flex}>
            <Text weight="medium" color="#7F1D1D">
              Error
            </Text>
            <Text size="xs" color={colors.red700}>
              {error}
            </Text>
          </View>
        </View>
      ) : null}

      {!online ? (
        <View style={styles.offline}>
          <WifiOff size={16} color={colors.orange600} />
          <Text size="xs" weight="medium" color={colors.orange600} style={styles.flex}>
            Sales can only be recorded online. Reconnect to complete this sale.
          </Text>
        </View>
      ) : null}

      <Button
        title="Complete Sale"
        loadingTitle="Processing..."
        icon={CheckCircle}
        variant="gradient"
        size="lg"
        fullWidth
        loading={processing}
        disabled={cart.length === 0 || !online}
        onPress={completeSale}
      />

      <ReceiptSheet sale={completedSale} onClose={() => setCompletedSale(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  historyButton: { alignItems: 'center', justifyContent: 'center', gap: 2, minWidth: 56, minHeight: 48, paddingHorizontal: 8, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.gray200, backgroundColor: colors.white },
  card: { gap: 12, padding: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.xl },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  empty: { alignItems: 'center', gap: 4, paddingVertical: 32 },
  cart: { gap: 8 },
  summary: { gap: 10, padding: 16, borderRadius: radius.xl, borderWidth: 2, borderColor: 'rgba(26,186,127,0.3)' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalRow: { paddingTop: 10, borderTopWidth: 2, borderTopColor: colors.gray200 },
  error: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.red200, backgroundColor: colors.red50 },
  offline: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.orange200, backgroundColor: colors.orange50 },
});
