import { CheckCircle, Info, XCircle } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ToastConfig, ToastConfigParams } from 'react-native-toast-message';

import { Text } from '@/components/ui/Text';
import { haptics } from '@/lib/haptics';
import { colors, radius, shadows } from '@/theme';

// Web Toaster (dashboard layout): rgba(255,255,255,0.95), rounded 16px, padding 20px, soft shadow.
function ToastCard({ text1, text2, kind }: ToastConfigParams<unknown> & { kind: 'success' | 'error' | 'info' }) {
  const Icon = kind === 'success' ? CheckCircle : kind === 'error' ? XCircle : Info;
  const color = kind === 'success' ? colors.success : kind === 'error' ? colors.danger : colors.info;
  useEffect(() => {
    if (kind === 'success') haptics.success();
    else if (kind === 'error') haptics.error();
  }, [kind, text1]);
  return (
    <View style={[styles.card, shadows.lg]} accessibilityRole="alert">
      <Icon size={20} color={color} />
      <View style={styles.body}>
        {text1 ? (
          <Text weight="semibold" color={colors.gray900}>
            {text1}
          </Text>
        ) : null}
        {text2 ? <Text color={colors.gray600}>{text2}</Text> : null}
      </View>
    </View>
  );
}

export const toastConfig: ToastConfig = {
  success: (props) => <ToastCard {...props} kind="success" />,
  error: (props) => <ToastCard {...props} kind="error" />,
  info: (props) => <ToastCard {...props} kind="info" />,
};

const styles = StyleSheet.create({
  card: {
    width: '92%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  body: { flex: 1, gap: 2 },
});
