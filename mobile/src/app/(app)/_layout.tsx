import { Stack } from 'expo-router';

import { useSessionValidation } from '@/features/auth/hooks';
import { useNotificationObserver, usePushRegistration } from '@/features/push/hooks';
import { colors, fonts } from '@/theme';

export default function AppLayout() {
  useSessionValidation();
  usePushRegistration();
  useNotificationObserver();
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.brandBlue,
        headerTitleStyle: { fontFamily: fonts.semibold, color: colors.gray900 },
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="orders/[id]" options={{ title: 'Order Details' }} />
      <Stack.Screen name="inventory/[medicationId]" options={{ title: 'Update Inventory' }} />
      <Stack.Screen name="sales-history" options={{ title: 'Sales History' }} />
      <Stack.Screen name="analytics" options={{ title: 'Analytics' }} />
      <Stack.Screen name="payment" options={{ title: 'Payment' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="staff" options={{ title: 'Staff' }} />
    </Stack>
  );
}
