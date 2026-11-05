import { Search, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { errorMessage } from '@/api/errors';
import { Text } from '@/components/ui';
import type { CatalogMedication } from '@/features/inventory/types';
import { formatNairaShort } from '@/lib/format';
import { colors, fonts, radius } from '@/theme';

import { MIN_SEARCH_LENGTH, useStockedMedicationSearch } from '../hooks';

interface Props {
  onSelect: (med: CatalogMedication) => void;
  disabled?: boolean;
}

// pos/new-sale AutocompleteInput: results render inline under the field instead of a floating dropdown.
export function MedicationSearch({ onSelect, disabled }: Props) {
  const [text, setText] = useState('');
  const [term, setTerm] = useState('');
  const query = useStockedMedicationSearch(term);

  useEffect(() => {
    const t = setTimeout(() => setTerm(text.trim()), 300);
    return () => clearTimeout(t);
  }, [text]);

  const showResults = term.length >= MIN_SEARCH_LENGTH && text.trim().length >= MIN_SEARCH_LENGTH;
  const results = query.data?.medications ?? [];

  return (
    <View style={styles.container}>
      <View style={[styles.field, disabled && styles.disabled]}>
        <Search size={16} color={colors.gray400} />
        <TextInput
          value={text}
          onChangeText={setText}
          editable={!disabled}
          placeholder="Type medication name..."
          placeholderTextColor={colors.gray400}
          style={styles.input}
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search medications"
        />
        {query.isFetching && showResults ? <ActivityIndicator size="small" color={colors.primary} /> : null}
        {text && !query.isFetching ? (
          <Pressable onPress={() => setText('')} hitSlop={10} accessibilityLabel="Clear search">
            <X size={16} color={colors.gray400} />
          </Pressable>
        ) : null}
      </View>

      {showResults ? (
        <View style={styles.results}>
          {query.isPending ? (
            <Text size="sm" color={colors.gray500} align="center" style={styles.message}>
              Searching...
            </Text>
          ) : query.isError ? (
            <Text size="sm" color={colors.red600} align="center" style={styles.message}>
              {errorMessage(query.error)}
            </Text>
          ) : results.length === 0 ? (
            <Text size="sm" color={colors.gray500} align="center" style={styles.message}>
              No medications found or not in stock.
            </Text>
          ) : (
            results.map((med, index) => (
              <Pressable
                key={med.medicationId}
                onPress={() => {
                  onSelect(med);
                  setText('');
                  setTerm('');
                }}
                accessibilityRole="button"
                accessibilityLabel={`Add ${med.brandName}, stock ${med.stock ?? 0}`}
                style={({ pressed }) => [styles.row, index > 0 && styles.divider, pressed && styles.pressed]}
              >
                <View style={styles.flex}>
                  <Text weight="medium" color={colors.gray900} numberOfLines={1}>
                    {med.brandName}
                  </Text>
                  <Text size="sm" color={colors.gray600} numberOfLines={1}>
                    {med.form} • Stock: {med.stock ?? 0}
                  </Text>
                </View>
                <Text weight="semibold" color={colors.gray900}>
                  {formatNairaShort(med.price)}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  container: { gap: 8 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, minHeight: 48, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray300, borderRadius: radius.lg },
  disabled: { opacity: 0.6 },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 16, color: colors.gray900, paddingVertical: 10 },
  results: { borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.lg, backgroundColor: colors.white, overflow: 'hidden' },
  message: { padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, minHeight: 56, paddingVertical: 8 },
  divider: { borderTopWidth: 1, borderTopColor: colors.gray100 },
  pressed: { backgroundColor: colors.gray50 },
});
