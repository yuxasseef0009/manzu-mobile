import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { haptics } from '@/lib/haptics';
import { colors, radius } from '@/theme';

import { Text } from './Text';

interface RadioRowProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: LucideIcon;
  color?: string;
  disabled?: boolean;
}

// Native stand-in for the web <select> options.
export function RadioRow({ label, selected, onPress, icon: Icon, color = colors.primary, disabled }: RadioRowProps) {
  return (
    <Pressable
      onPress={() => {
        if (!selected) haptics.selection();
        onPress();
      }}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [styles.row, selected && { borderColor: color, backgroundColor: `${color}12` }, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <View style={[styles.radio, selected && { borderColor: color }]}>{selected ? <View style={[styles.dot, { backgroundColor: color }]} /> : null}</View>
      {Icon ? <Icon size={16} color={selected ? color : colors.gray500} /> : null}
      <Text weight={selected ? 'semibold' : 'medium'} color={colors.gray900} style={styles.flex}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingHorizontal: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.gray200, backgroundColor: colors.white },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.gray300, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
});
