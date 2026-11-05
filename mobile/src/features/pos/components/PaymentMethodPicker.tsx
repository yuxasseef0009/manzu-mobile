import { Banknote, CreditCard, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import type { SalePaymentMethod } from '@/features/sales/types';
import { colors, radius, shadows } from '@/theme';

const METHODS: { method: SalePaymentMethod; label: string; icon: LucideIcon }[] = [
  { method: 'CASH', label: 'Cash', icon: Banknote },
  { method: 'CARD', label: 'Card', icon: CreditCard },
];

// pos/new-sale PaymentMethodButton pair.
export function PaymentMethodPicker({ value, onChange, disabled }: { value: SalePaymentMethod; onChange: (m: SalePaymentMethod) => void; disabled?: boolean }) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {METHODS.map(({ method, label, icon: Icon }) => {
        const selected = value === method;
        return (
          <Pressable
            key={method}
            onPress={() => onChange(method)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled }}
            style={[styles.option, selected ? [styles.selected, shadows.md] : null, disabled && styles.disabled]}
          >
            <Icon size={24} color={selected ? colors.primary : colors.gray600} />
            <Text size="base" weight="medium" color={selected ? colors.primary : colors.gray700}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  option: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 14, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.gray200, backgroundColor: colors.white },
  selected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  disabled: { opacity: 0.5 },
});
