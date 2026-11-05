import { Mail, Pencil, Trash2, UserPlus, Users } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { errorMessage } from '@/api/errors';
import { Badge, Button, Card, CardContent, EmptyState, ErrorState, LoadingState, Screen, Text } from '@/components/ui';
import { useSession } from '@/features/auth/store';
import { useIsOnline } from '@/lib/network';
import { roleLabel } from '@/lib/roles';
import { colors } from '@/theme';

import { StaffFormSheet } from '../components/StaffFormSheet';
import { useDeleteStaff, useStaff } from '../hooks';
import type { StaffUser } from '../types';

// No web page exists; built on GET /pharmacy/users + /auth/add-user, /auth/users/:id (manager only).
export function StaffScreen() {
  const online = useIsOnline();
  const currentUserId = useSession((s) => s.user?.id);
  const staff = useStaff();
  const deleteMutation = useDeleteStaff();
  const [sheet, setSheet] = useState<{ open: boolean; user: StaffUser | null }>({ open: false, user: null });

  const confirmDelete = (user: StaffUser) => {
    Alert.alert('Remove staff member?', `${user.name} will no longer be able to sign in to this pharmacy.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () =>
          deleteMutation.mutate(user.id, {
            onSuccess: () => Toast.show({ type: 'success', text1: 'Staff member removed' }),
            onError: (err) => Toast.show({ type: 'error', text1: errorMessage(err) || 'Failed to remove staff member' }),
          }),
      },
    ]);
  };

  const users = staff.data?.users ?? [];

  return (
    <Screen edges={['bottom']} refreshing={staff.isRefetching} onRefresh={() => void staff.refetch()} dataUpdatedAt={staff.dataUpdatedAt || undefined}>
      <View style={styles.header}>
        <View style={styles.flex}>
          <Text size="2xl" weight="bold" color={colors.gray900}>
            Staff
          </Text>
          <Text color={colors.gray600}>Manage who can sign in to your pharmacy</Text>
        </View>
        <Button title="Add" icon={UserPlus} variant="gradient" disabled={!online} onPress={() => setSheet({ open: true, user: null })} accessibilityLabel="Add staff member" />
      </View>

      {staff.isPending ? (
        <LoadingState label="Loading staff..." />
      ) : staff.isError ? (
        <ErrorState error={staff.error} onRetry={() => void staff.refetch()} />
      ) : users.length === 0 ? (
        <EmptyState title="No staff yet" description="Add pharmacists, technicians and staff so they can sign in." icon={Users} actionTitle="Add Staff Member" onAction={() => setSheet({ open: true, user: null })} />
      ) : (
        users.map((user) => {
          const self = user.id === currentUserId;
          return (
            <Card key={user.id}>
              <CardContent style={styles.row}>
                <View style={styles.flex}>
                  <View style={styles.nameRow}>
                    <Text size="base" weight="semibold" color={colors.gray900} numberOfLines={1} style={styles.shrink}>
                      {user.name}
                    </Text>
                    {self ? <Badge variant="info" label="You" /> : null}
                  </View>
                  <View style={styles.nameRow}>
                    <Mail size={12} color={colors.gray500} />
                    <Text size="xs" color={colors.gray600} numberOfLines={1} style={styles.shrink}>
                      {user.email}
                    </Text>
                  </View>
                  <Badge variant={user.role === 'MANAGER' ? 'default' : 'secondary'} label={roleLabel(user.role)} />
                </View>
                {self ? null : (
                  <View style={styles.actions}>
                    <Button title="" icon={Pencil} variant="outline" disabled={!online} onPress={() => setSheet({ open: true, user })} accessibilityLabel={`Edit ${user.name}`} />
                    <Button
                      title=""
                      icon={Trash2}
                      variant="destructive"
                      disabled={!online || (deleteMutation.isPending && deleteMutation.variables === user.id)}
                      onPress={() => confirmDelete(user)}
                      accessibilityLabel={`Remove ${user.name}`}
                    />
                  </View>
                )}
              </CardContent>
            </Card>
          );
        })
      )}

      <StaffFormSheet visible={sheet.open} user={sheet.user} onClose={() => setSheet((s) => ({ ...s, open: false }))} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 4 },
  shrink: { flexShrink: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actions: { flexDirection: 'row', gap: 8 },
});
