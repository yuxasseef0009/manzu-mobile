import { zodResolver } from '@hookform/resolvers/zod';
import { Info } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { errorMessage } from '@/api/errors';
import { Badge, Button, ChipGroup, Input, PinInput, Sheet, Text } from '@/components/ui';
import { useIsOnline } from '@/lib/network';
import { ASSIGNABLE_ROLES, roleLabel, type AssignableRole } from '@/lib/roles';
import { colors, radius } from '@/theme';

import { useAddStaff, useEditStaff } from '../hooks';
import { staffFormSchema, type StaffFormValues } from '../schemas';
import type { StaffUser } from '../types';

interface Props {
  visible: boolean;
  /** null = add a new staff member. */
  user: StaffUser | null;
  onClose: () => void;
}

const ROLE_OPTIONS = ASSIGNABLE_ROLES.map((value) => ({ value, label: roleLabel(value) }));

const isAssignable = (role: string): role is AssignableRole => (ASSIGNABLE_ROLES as readonly string[]).includes(role);

export function StaffFormSheet({ visible, user, onClose }: Props) {
  const online = useIsOnline();
  const mode = user ? 'edit' : 'create';
  const schema = useMemo(() => staffFormSchema(mode), [mode]);
  const addMutation = useAddStaff();
  const editMutation = useEditStaff();
  const pending = addMutation.isPending || editMutation.isPending;

  const { control, handleSubmit, formState, reset } = useForm<StaffFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', pin: '', role: 'STAFF' },
  });

  useEffect(() => {
    if (visible) reset({ name: user?.name ?? '', email: user?.email ?? '', pin: '', role: user && isAssignable(user.role) ? user.role : 'STAFF' });
  }, [visible, user, reset]);

  const onError = (err: unknown) => Toast.show({ type: 'error', text1: errorMessage(err) || 'Something went wrong' });

  const onSubmit = handleSubmit((values) => {
    if (user) {
      editMutation.mutate(
        { userId: user.id, body: { name: values.name, email: values.email, ...(values.pin ? { pin: values.pin } : {}) } },
        {
          onSuccess: () => {
            Toast.show({ type: 'success', text1: 'Staff member updated' });
            onClose();
          },
          onError,
        },
      );
    } else {
      addMutation.mutate(values, {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: 'Staff member added' });
          onClose();
        },
        onError,
      });
    }
  });

  return (
    <Sheet visible={visible} onClose={onClose} title={user ? 'Edit Staff Member' : 'Add Staff Member'} locked={pending}>
      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange, onBlur } }) => <Input label="Full Name" required value={value} onChangeText={onChange} onBlur={onBlur} placeholder="e.g. Amina Bello" autoCapitalize="words" error={formState.errors.name?.message} />}
      />
      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input label="Email" required value={value} onChangeText={onChange} onBlur={onBlur} placeholder="staff@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="off" error={formState.errors.email?.message} />
        )}
      />
      <View style={styles.field}>
        <Text weight="medium" color={colors.gray900}>
          Role {user ? null : <Text color={colors.danger}>*</Text>}
        </Text>
        {user ? (
          <>
            <Badge variant="secondary" label={roleLabel(user.role)} />
            <View style={styles.note}>
              <Info size={14} color={colors.blue600} />
              <Text size="xs" color={colors.blue800} style={styles.flex}>
                {"The server doesn't support changing roles yet. To change a role, remove the member and add them again."}
              </Text>
            </View>
          </>
        ) : (
          <Controller control={control} name="role" render={({ field: { value, onChange } }) => <ChipGroup options={ROLE_OPTIONS} value={value} onChange={onChange} segmented />} />
        )}
      </View>
      <Controller
        control={control}
        name="pin"
        render={({ field: { value, onChange } }) => (
          <View style={styles.field}>
            <PinInput label={user ? 'New 6-Digit PIN (optional)' : '6-Digit PIN'} value={value} onChange={onChange} error={formState.errors.pin?.message} />
            {user ? (
              <Text size="xs" color={colors.gray500} align="center">
                Leave blank to keep the current PIN
              </Text>
            ) : null}
          </View>
        )}
      />
      <Button title={user ? 'Save Changes' : 'Add Staff Member'} loadingTitle="Saving..." variant="gradient" fullWidth loading={pending} disabled={!online} onPress={onSubmit} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  field: { gap: 6 },
  note: { flexDirection: 'row', gap: 6, padding: 8, borderRadius: radius.md, backgroundColor: colors.blue50 },
});
