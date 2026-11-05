import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, DateField, Input, RadioRow, Sheet, Text } from '@/components/ui';
import { colors } from '@/theme';

import type { SalesFilters } from '../types';
import { EMPTY_SALES_FILTERS } from '../utils';

const PAYMENT_OPTIONS: { value: SalesFilters['paymentMethod']; label: string }[] = [
  { value: '', label: 'All Methods' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
];

interface Props {
  visible: boolean;
  filters: SalesFilters;
  onApply: (filters: SalesFilters) => void;
  onClose: () => void;
}

function amountText(t: string): string {
  const cleaned = t.replace(/[^0-9.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  return rest.length ? `${whole}.${rest.join('')}` : cleaned;
}

// sales-history/page.jsx filter inputs. Edits a draft so amounts don't refetch on every keystroke.
export function SalesFilterSheet({ visible, filters, onApply, onClose }: Props) {
  const [draft, setDraft] = useState(filters);
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setDraft(filters);
  }

  const set = (patch: Partial<SalesFilters>) => setDraft((d) => ({ ...d, ...patch }));
  const rangeIncomplete = !draft.date && !!draft.startDate !== !!draft.endDate;
  const rangeInverted = !draft.date && !!draft.startDate && !!draft.endDate && draft.startDate > draft.endDate;
  const amountInverted = !!draft.minAmount && !!draft.maxAmount && Number(draft.minAmount) > Number(draft.maxAmount);

  return (
    <Sheet visible={visible} onClose={onClose} title="Filters">
      <DateField label="Specific Date" value={draft.date} onChange={(date) => set({ date, startDate: '', endDate: '' })} />
      <View style={styles.row}>
        <View style={styles.flex}>
          <DateField label="Date Range Start" value={draft.startDate} onChange={(startDate) => set({ startDate, date: '' })} />
        </View>
        <View style={styles.flex}>
          <DateField label="Date Range End" value={draft.endDate} onChange={(endDate) => set({ endDate, date: '' })} />
        </View>
      </View>
      {rangeIncomplete ? (
        <Text size="xs" color={colors.orange600}>
          Pick both a start and an end date to filter by range.
        </Text>
      ) : null}
      {rangeInverted ? (
        <Text size="xs" color={colors.red600}>
          The start date is after the end date.
        </Text>
      ) : null}

      <View style={styles.group}>
        <Text weight="semibold" color={colors.gray700}>
          Payment Method
        </Text>
        {PAYMENT_OPTIONS.map((opt) => (
          <RadioRow key={opt.label} label={opt.label} selected={draft.paymentMethod === opt.value} onPress={() => set({ paymentMethod: opt.value })} />
        ))}
      </View>

      <View style={styles.row}>
        <View style={styles.flex}>
          <Input label="Min Amount (₦)" value={draft.minAmount} onChangeText={(t) => set({ minAmount: amountText(t) })} placeholder="0" keyboardType="decimal-pad" />
        </View>
        <View style={styles.flex}>
          <Input label="Max Amount (₦)" value={draft.maxAmount} onChangeText={(t) => set({ maxAmount: amountText(t) })} placeholder="∞" keyboardType="decimal-pad" />
        </View>
      </View>
      {amountInverted ? (
        <Text size="xs" color={colors.red600}>
          Min amount is greater than max amount.
        </Text>
      ) : null}

      <View style={styles.row}>
        <Button title="Reset" variant="outline" style={styles.flex} onPress={() => setDraft(EMPTY_SALES_FILTERS)} />
        <Button
          title="Apply"
          variant="gradient"
          style={styles.flex}
          disabled={rangeInverted || amountInverted}
          onPress={() => {
            onApply(draft);
            onClose();
          }}
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', gap: 12 },
  group: { gap: 8 },
});
