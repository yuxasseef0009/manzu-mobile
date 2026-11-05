import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { ChipGroup, ErrorState, LoadingState, Screen, Text } from '@/components/ui';
import { useIsManager } from '@/features/auth/hooks';
import { colors } from '@/theme';

import { profileKeys } from '../api';
import { GeneralTab } from '../components/GeneralTab';
import { HoursTab } from '../components/HoursTab';
import { LocationTab } from '../components/LocationTab';
import { PharmacyStatusBanner } from '../components/PharmacyStatusBanner';
import { ProfileHeaderCard } from '../components/ProfileHeaderCard';
import { SecurityTab } from '../components/SecurityTab';
import { useProfile } from '../hooks';

type Tab = 'general' | 'location' | 'hours' | 'security';
const TABS: { value: Tab; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'location', label: 'Location' },
  { value: 'hours', label: 'Hours' },
  { value: 'security', label: 'Security' },
];

// manzu-f (dashboard)/profile/page.jsx: header + General · Location · Hours · Security tabs.
export function ProfileScreen() {
  const queryClient = useQueryClient();
  const manager = useIsManager();
  const profile = useProfile();
  const [tab, setTab] = useState<Tab>('general');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.refetchQueries({ queryKey: profileKeys.all, type: 'active' });
    setRefreshing(false);
  }, [queryClient]);

  if (profile.isPending) return <LoadingState label="Loading profile..." />;
  if (profile.isError) return <ErrorState error={profile.error} onRetry={() => void profile.refetch()} />;

  return (
    <Screen edges={['bottom']} refreshing={refreshing} onRefresh={onRefresh} dataUpdatedAt={profile.dataUpdatedAt || undefined}>
      <View>
        <Text size="2xl" weight="bold" color={colors.gray900}>
          Pharmacy Profile
        </Text>
        <Text color={colors.gray600}>Manage your pharmacy information and settings</Text>
      </View>
      <PharmacyStatusBanner status={profile.data.pharmacy.status} />
      <ProfileHeaderCard profile={profile.data} manager={manager} />
      <ChipGroup options={TABS} value={tab} onChange={setTab} segmented />
      {tab === 'general' ? (
        <GeneralTab profile={profile.data} manager={manager} />
      ) : tab === 'location' ? (
        <LocationTab profile={profile.data} manager={manager} />
      ) : tab === 'hours' ? (
        <HoursTab manager={manager} />
      ) : (
        <SecurityTab profile={profile.data} />
      )}
    </Screen>
  );
}
