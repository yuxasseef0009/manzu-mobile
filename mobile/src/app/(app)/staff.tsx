import { Redirect } from 'expo-router';

import { useIsManager } from '@/features/auth/hooks';
import { StaffScreen } from '@/features/staff/screens/StaffScreen';

export default function StaffRoute() {
  const manager = useIsManager();
  if (!manager) return <Redirect href="/more" />;
  return <StaffScreen />;
}
