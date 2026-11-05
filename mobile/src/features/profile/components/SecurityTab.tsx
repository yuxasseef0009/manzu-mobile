import { zodResolver } from '@hookform/resolvers/zod';
import { Clock, KeyRound, Mail, Shield, User } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import Toast from 'react-native-toast-message';

import { errorMessage } from '@/api/errors';
import { Button, Card, CardContent, CardHeader, CardTitle, PinInput } from '@/components/ui';
import { formatDateTime } from '@/lib/format';
import { useIsOnline } from '@/lib/network';
import { roleLabel } from '@/lib/roles';
import { colors } from '@/theme';

import { useChangePin } from '../hooks';
import { changePinSchema, type ChangePinFormValues } from '../schemas';
import type { ProfileResponse } from '../types';
import { InfoRow } from './InfoRow';

// Web "Security" tab: account details + PATCH /api/auth/change-password { currentPin, newPin }.
export function SecurityTab({ profile }: { profile: ProfileResponse }) {
  const online = useIsOnline();
  const changePin = useChangePin();
  const { control, handleSubmit, formState, reset } = useForm<ChangePinFormValues>({ resolver: zodResolver(changePinSchema), defaultValues: { currentPin: '', newPin: '', confirmPin: '' } });
  const { user } = profile;

  const onSubmit = handleSubmit(({ currentPin, newPin }) => {
    changePin.mutate(
      { currentPin, newPin },
      {
        onSuccess: () => {
          reset();
          Toast.show({ type: 'success', text1: 'PIN changed successfully' });
        },
        onError: (err) => Toast.show({ type: 'error', text1: errorMessage(err) || 'Failed to change PIN' }),
      },
    );
  });

  return (
    <>
      <Card>
        <CardHeader tinted>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoRow icon={User} label="Name" value={user.name} />
          <InfoRow icon={Mail} label="Email" value={user.email} />
          <InfoRow icon={Shield} label="Role" value={roleLabel(user.role)} />
          <InfoRow icon={Clock} label="Last Login" value={user.lastLogin ? formatDateTime(user.lastLogin) : null} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader tinted>
          <KeyRound size={18} color={colors.primary} />
          <CardTitle>Change PIN</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller control={control} name="currentPin" render={({ field: { value, onChange } }) => <PinInput label="Current PIN" value={value} onChange={onChange} error={formState.errors.currentPin?.message} />} />
          <Controller control={control} name="newPin" render={({ field: { value, onChange } }) => <PinInput label="New PIN" value={value} onChange={onChange} error={formState.errors.newPin?.message} />} />
          <Controller control={control} name="confirmPin" render={({ field: { value, onChange } }) => <PinInput label="Confirm New PIN" value={value} onChange={onChange} onSubmit={onSubmit} error={formState.errors.confirmPin?.message} />} />
          <Button title="Change PIN" loadingTitle="Changing..." variant="gradient" fullWidth loading={changePin.isPending} disabled={!online} onPress={onSubmit} />
        </CardContent>
      </Card>
    </>
  );
}
