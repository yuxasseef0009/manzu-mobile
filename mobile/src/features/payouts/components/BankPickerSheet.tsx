import { Check, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Input, Sheet, Text } from '@/components/ui';
import { colors, radius } from '@/theme';

import type { Bank } from '../types';

interface Props {
  visible: boolean;
  banks: Bank[];
  selectedCode: string;
  onSelect: (bank: Bank) => void;
  onClose: () => void;
}

// Searchable replacement for the web <select> (Paystack returns ~200 banks).
export function BankPickerSheet({ visible, banks, selectedCode, onSelect, onClose }: Props) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? banks.filter((b) => b.name.toLowerCase().includes(q)) : banks;
  }, [banks, search]);

  const close = () => {
    setSearch('');
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={close} title="Select Bank">
      <View style={styles.search}>
        <Search size={16} color={colors.gray400} style={styles.searchIcon} />
        <Input value={search} onChangeText={setSearch} placeholder="Search banks" autoCorrect={false} style={styles.searchInput} accessibilityLabel="Search banks" />
      </View>
      {filtered.length === 0 ? (
        <Text color={colors.gray500} align="center">
          No banks match “{search}”
        </Text>
      ) : (
        <View>
          {filtered.map((bank, i) => {
            const selected = bank.code === selectedCode;
            return (
              <Pressable
                key={`${bank.code}-${i}`}
                onPress={() => {
                  onSelect(bank);
                  close();
                }}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={({ pressed }) => [styles.row, i > 0 && styles.divider, pressed && styles.pressed]}
              >
                <Text size="base" color={selected ? colors.primaryDark : colors.gray800} weight={selected ? 'semibold' : 'regular'} style={styles.flex}>
                  {bank.name}
                </Text>
                {selected ? <Check size={18} color={colors.primary} /> : null}
              </Pressable>
            );
          })}
        </View>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  search: { justifyContent: 'center' },
  searchIcon: { position: 'absolute', left: 12, zIndex: 1 },
  searchInput: { paddingLeft: 36 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingHorizontal: 4 },
  divider: { borderTopWidth: 1, borderTopColor: colors.gray100 },
  pressed: { backgroundColor: colors.primarySoft, borderRadius: radius.md },
});
