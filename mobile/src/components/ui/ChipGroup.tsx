import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';

import { Text } from './Text';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface ChipGroupProps<T extends string> {
  options: readonly ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Equal-width segments in one row (tabs) instead of wrapping chips. */
  segmented?: boolean;
}

// Web pill buttons: active bg-[#1ABA7F] text-white, inactive bg-gray-100 text-gray-700.
export function ChipGroup<T extends string>({ options, value, onChange, segmented }: ChipGroupProps<T>) {
  return (
    <View style={[styles.row, segmented && styles.segmented]} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.chip, segmented && styles.segment, { backgroundColor: active ? colors.primary : segmented ? 'transparent' : colors.gray100 }]}
          >
            <Text size="sm" weight="medium" color={active ? colors.white : colors.gray700} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segmented: { flexWrap: 'nowrap', gap: 4, padding: 4, borderRadius: radius.lg, backgroundColor: colors.gray100 },
  chip: { paddingHorizontal: 12, minHeight: 36, justifyContent: 'center', alignItems: 'center', borderRadius: radius.lg },
  segment: { flex: 1, minHeight: 40, paddingHorizontal: 4 },
});
