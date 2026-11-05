import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors } from '@/theme';

export function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | null | undefined }) {
  return (
    <View style={styles.row}>
      <Icon size={16} color={colors.gray500} style={styles.icon} />
      <View style={styles.flex}>
        <Text size="xs" color={colors.gray500}>
          {label}
        </Text>
        <Text color={value ? colors.gray900 : colors.gray400}>{value || 'Not set'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', gap: 12 },
  icon: { marginTop: 2 },
});
