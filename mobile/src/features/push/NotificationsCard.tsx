import { Bell, BellOff } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { errorMessage } from '@/api/errors';
import { Button, Card, Text } from '@/components/ui';
import { colors } from '@/theme';

import { usePushStatus } from './hooks';
import type { PushAvailability } from './notifications';

const UNAVAILABLE: Record<Exclude<PushAvailability, 'available' | 'disabled'>, string> = {
  unsupported: 'Push notifications need a physical phone.',
  'expo-go': 'Push notifications need a development or store build (not Expo Go).',
  'no-project': 'Push notifications are not configured for this build (missing EAS project ID).',
};

// More → Notifications. Hidden entirely while the push flag is off.
export function NotificationsCard() {
  const { availability, permission, enable } = usePushStatus();
  const [busy, setBusy] = useState(false);
  if (availability === 'disabled') return null;

  const on = availability === 'available' && !!permission?.granted;
  const description =
    availability !== 'available'
      ? UNAVAILABLE[availability]
      : on
        ? 'New order alerts are on for this device. Only the most recently signed-in device gets alerts.'
        : 'Get alerted on this device when new orders arrive.';

  const onPress = async () => {
    if (permission && !permission.granted && !permission.canAskAgain) {
      void Linking.openSettings();
      return;
    }
    setBusy(true);
    try {
      const ok = await enable();
      Toast.show(ok ? { type: 'success', text1: 'Notifications enabled' } : { type: 'info', text1: 'Notifications are off', text2: 'You can turn them on in Settings.' });
    } catch (e) {
      Toast.show({ type: 'error', text1: errorMessage(e) || 'Could not enable notifications' });
    } finally {
      setBusy(false);
    }
  };

  const Icon = on ? Bell : BellOff;
  return (
    <Card>
      <View style={styles.row}>
        <Icon size={20} color={on ? colors.primary : colors.gray500} />
        <View style={styles.flex}>
          <Text size="base" weight="medium" color={colors.gray700}>
            Notifications
          </Text>
          <Text size="xs" color={colors.gray500}>
            {description}
          </Text>
        </View>
        {availability === 'available' && !on ? (
          <Button title={permission && !permission.canAskAgain ? 'Settings' : 'Enable'} size="sm" variant="outline" loading={busy} onPress={() => void onPress()} />
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
});
