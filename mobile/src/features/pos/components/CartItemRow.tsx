import { AlertTriangle, Minus, Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/components/ui';
import { formatNairaShort } from '@/lib/format';
import { colors, fonts, radius, shadows } from '@/theme';

import type { CartItem } from '../types';

interface Props {
  item: CartItem;
  onQuantity: (medicationId: number, quantity: number) => void;
  onRemove: (medicationId: number) => void;
  disabled?: boolean;
}

// pos/new-sale CartItem.
export function CartItemRow({ item, onQuantity, onRemove, disabled }: Props) {
  const [draft, setDraft] = useState(String(item.quantity));
  const [shownQuantity, setShownQuantity] = useState(item.quantity);
  if (item.quantity !== shownQuantity) {
    setShownQuantity(item.quantity);
    setDraft(String(item.quantity));
  }
  const atMax = item.quantity >= item.availableStock;
  const meta = [item.form, item.packSize].filter(Boolean).join(' • ');

  return (
    <View style={[styles.card, shadows.sm]}>
      <View style={styles.top}>
        <View style={styles.flex}>
          <Text size="base" weight="semibold" color={colors.gray900} numberOfLines={1}>
            {item.name}
          </Text>
          {meta ? (
            <Text size="sm" color={colors.gray600} numberOfLines={1}>
              {meta}
            </Text>
          ) : null}
          <Text size="xs" color={colors.gray500}>
            Stock:{' '}
            <Text size="xs" weight="medium" color={colors.gray700}>
              {item.availableStock}
            </Text>
          </Text>
        </View>
        <Pressable onPress={() => onRemove(item.medicationId)} disabled={disabled} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Remove ${item.name}`} style={styles.iconButton}>
          <Trash2 size={18} color={colors.red600} />
        </Pressable>
      </View>

      <View style={styles.bottom}>
        <View style={styles.qty}>
          <Pressable
            onPress={() => onQuantity(item.medicationId, item.quantity - 1)}
            disabled={disabled || item.quantity <= 1}
            accessibilityRole="button"
            accessibilityLabel={`Decrease ${item.name} quantity`}
            style={[styles.qtyButton, (disabled || item.quantity <= 1) && styles.dim]}
          >
            <Minus size={16} color={colors.gray600} />
          </Pressable>
          <TextInput
            value={draft}
            onChangeText={(t) => setDraft(t.replace(/[^0-9]/g, ''))}
            onEndEditing={() => {
              const next = parseInt(draft, 10) || 1;
              onQuantity(item.medicationId, next);
              setDraft(String(Math.max(1, Math.min(next, item.availableStock))));
            }}
            editable={!disabled}
            keyboardType="number-pad"
            selectTextOnFocus
            style={styles.qtyInput}
            accessibilityLabel={`${item.name} quantity`}
          />
          <Pressable
            onPress={() => onQuantity(item.medicationId, item.quantity + 1)}
            disabled={disabled || atMax}
            accessibilityRole="button"
            accessibilityLabel={`Increase ${item.name} quantity`}
            style={[styles.qtyButton, (disabled || atMax) && styles.dim]}
          >
            <Plus size={16} color={colors.gray600} />
          </Pressable>
        </View>
        <View style={styles.price}>
          <Text size="base" weight="bold" color={colors.gray900}>
            {formatNairaShort(item.price * item.quantity)}
          </Text>
          <Text size="xs" color={colors.gray500}>
            @ {formatNairaShort(item.price)}
          </Text>
        </View>
      </View>

      {atMax ? (
        <View style={styles.warning}>
          <AlertTriangle size={12} color={colors.orange600} />
          <Text size="xs" color={colors.orange600}>
            Max quantity reached
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  card: { gap: 10, padding: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.lg },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  iconButton: { minWidth: 36, minHeight: 36, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  qty: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, borderWidth: 1, borderColor: colors.gray200, backgroundColor: colors.gray50 },
  dim: { opacity: 0.4 },
  qtyInput: { width: 56, height: 40, textAlign: 'center', borderWidth: 1, borderColor: colors.gray300, borderRadius: radius.md, fontFamily: fonts.semibold, fontSize: 16, color: colors.gray900, paddingVertical: 0 },
  price: { alignItems: 'flex-end' },
  warning: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 6, borderRadius: radius.sm, backgroundColor: colors.orange50 },
});
