import { Check, ChevronDown, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';

import { Input } from './Input';
import { Sheet } from './Sheet';
import { Text } from './Text';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: readonly (string | SelectOption)[];
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  /** Show a search box (long lists such as states / LGAs). */
  searchable?: boolean;
}

const toOption = (o: string | SelectOption): SelectOption => (typeof o === 'string' ? { value: o, label: o } : o);

// Native replacement for the web <select>: field + bottom-sheet list.
export function SelectField({ label, value, options, onChange, required, placeholder = 'Select', error, disabled, searchable }: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const all = useMemo(() => options.map(toOption), [options]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? all.filter((o) => o.label.toLowerCase().includes(q)) : all;
  }, [all, search]);
  const selected = all.find((o) => o.value === value);

  const close = () => {
    setSearch('');
    setOpen(false);
  };

  return (
    <View style={styles.field}>
      <Text weight="medium" color={colors.gray900}>
        {label} {required ? <Text color={colors.danger}>*</Text> : null}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${label}${selected ? `, ${selected.label}` : ''}`}
        accessibilityState={{ disabled }}
        style={[styles.input, !!error && styles.inputError, disabled && styles.disabled]}
      >
        <Text color={selected ? colors.gray900 : colors.gray400} numberOfLines={1} style={styles.flex}>
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown size={16} color={colors.gray500} />
      </Pressable>
      {error ? (
        <Text size="xs" color={colors.red600}>
          {error}
        </Text>
      ) : null}
      <Sheet visible={open} onClose={close} title={label}>
        {searchable ? (
          <View style={styles.search}>
            <Search size={16} color={colors.gray400} style={styles.searchIcon} />
            <Input value={search} onChangeText={setSearch} placeholder={`Search ${label.toLowerCase()}`} autoCorrect={false} style={styles.searchInput} accessibilityLabel={`Search ${label}`} />
          </View>
        ) : null}
        {filtered.length === 0 ? (
          <Text color={colors.gray500} align="center">
            No matches for “{search}”
          </Text>
        ) : (
          <View>
            {filtered.map((option, i) => {
              const isSelected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onChange(option.value);
                    close();
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  style={({ pressed }) => [styles.row, i > 0 && styles.divider, pressed && styles.pressed]}
                >
                  <Text size="base" color={isSelected ? colors.primaryDark : colors.gray800} weight={isSelected ? 'semibold' : 'regular'} style={styles.flex}>
                    {option.label}
                  </Text>
                  {isSelected ? <Check size={18} color={colors.primary} /> : null}
                </Pressable>
              );
            })}
          </View>
        )}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  field: { gap: 6 },
  input: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.gray300, borderRadius: radius.lg, backgroundColor: colors.white },
  inputError: { borderColor: colors.red300, backgroundColor: colors.red50 },
  disabled: { opacity: 0.6 },
  search: { justifyContent: 'center' },
  searchIcon: { position: 'absolute', left: 12, zIndex: 1 },
  searchInput: { paddingLeft: 36 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingHorizontal: 4 },
  divider: { borderTopWidth: 1, borderTopColor: colors.gray100 },
  pressed: { backgroundColor: colors.primarySoft, borderRadius: radius.md },
});
