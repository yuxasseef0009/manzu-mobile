import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, FileBadge, Mail, MapPin, Pencil, Phone, Truck, User } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { StyleSheet, Switch, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { errorMessage } from '@/api/errors';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SelectField, Text } from '@/components/ui';
import { useIsOnline } from '@/lib/network';
import { lgasForState, NIGERIAN_STATES } from '@/lib/nigeria';
import { colors } from '@/theme';

import { useUpdateProfile } from '../hooks';
import { profileFormSchema, type ProfileFormValues } from '../schemas';
import type { ProfileResponse } from '../types';
import { buildProfilePayload } from '../utils';
import { InfoRow } from './InfoRow';

function defaults({ user, pharmacy }: ProfileResponse): ProfileFormValues {
  return {
    userName: user.name,
    userEmail: user.email,
    name: pharmacy.name,
    address: pharmacy.address,
    state: pharmacy.state,
    lga: pharmacy.lga,
    ward: pharmacy.ward ?? '',
    phone: pharmacy.phone,
    deliveryAvailability: pharmacy.deliveryAvailability ?? false,
  };
}

// Web "General Info" tab. Edit mode is manager-only (PATCH /profile is authorizeRoles('MANAGER')).
export function GeneralTab({ profile, manager }: { profile: ProfileResponse; manager: boolean }) {
  const online = useIsOnline();
  const [editing, setEditing] = useState(false);
  const update = useUpdateProfile();
  const { control, handleSubmit, formState, reset, setValue } = useForm<ProfileFormValues>({ resolver: zodResolver(profileFormSchema), defaultValues: defaults(profile) });
  const state = useWatch({ control, name: 'state' });
  const { user, pharmacy } = profile;

  const startEdit = () => {
    reset(defaults(profile));
    setEditing(true);
  };

  const onSave = handleSubmit((v) => {
    const body = buildProfilePayload(profile, {
      user: { name: v.userName, email: v.userEmail },
      pharmacy: { name: v.name, address: v.address, state: v.state, lga: v.lga, ward: v.ward, phone: v.phone, deliveryAvailability: v.deliveryAvailability },
    });
    update.mutate(body, {
      onSuccess: () => {
        setEditing(false);
        Toast.show({ type: 'success', text1: 'Profile updated successfully' });
      },
      onError: (err) => Toast.show({ type: 'error', text1: errorMessage(err) || 'Failed to update profile' }),
    });
  });

  if (!editing) {
    return (
      <Card>
        <CardHeader tinted>
          <View style={styles.flex}>
            <CardTitle>General Information</CardTitle>
          </View>
          {manager ? <Button title="Edit" icon={Pencil} size="sm" variant="outline" onPress={startEdit} /> : null}
        </CardHeader>
        <CardContent>
          <InfoRow icon={User} label="Your Name" value={user.name} />
          <InfoRow icon={Mail} label="Your Email" value={user.email} />
          <InfoRow icon={Building2} label="Pharmacy Name" value={pharmacy.name} />
          <InfoRow icon={FileBadge} label="License Number" value={pharmacy.licenseNumber} />
          <InfoRow icon={Phone} label="Phone" value={pharmacy.phone} />
          <InfoRow icon={MapPin} label="Address" value={[pharmacy.address, pharmacy.ward, pharmacy.lga, pharmacy.state].filter(Boolean).join(', ')} />
          <InfoRow icon={Truck} label="Delivery" value={pharmacy.deliveryAvailability ? 'Delivery available' : 'Pickup only'} />
          {!manager ? (
            <Text size="xs" color={colors.gray500}>
              Only managers can edit the pharmacy profile.
            </Text>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  const field = (name: 'userName' | 'userEmail' | 'name' | 'address' | 'ward' | 'phone', label: string, extra: Partial<React.ComponentProps<typeof Input>> = {}) => (
    <Controller control={control} name={name} render={({ field: { value, onChange, onBlur } }) => <Input label={label} value={value} onChangeText={onChange} onBlur={onBlur} error={formState.errors[name]?.message} {...extra} />} />
  );

  return (
    <Card>
      <CardHeader tinted>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {field('userName', 'Your Name', { required: true, autoCapitalize: 'words' })}
        {field('userEmail', 'Your Email', { required: true, keyboardType: 'email-address', autoCapitalize: 'none' })}
        {field('name', 'Pharmacy Name', { required: true })}
        {field('phone', 'Phone', { required: true, keyboardType: 'phone-pad' })}
        {field('address', 'Address', { required: true, multiline: true })}
        <Controller
          control={control}
          name="state"
          render={({ field: { value } }) => (
            <SelectField
              label="State"
              required
              searchable
              value={value}
              options={NIGERIAN_STATES}
              onChange={(s) => {
                setValue('state', s, { shouldValidate: true });
                if (s !== value) setValue('lga', '');
              }}
              error={formState.errors.state?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="lga"
          render={({ field: { value, onChange } }) => (
            <SelectField label="LGA" required searchable value={value} options={lgasForState(state)} onChange={onChange} placeholder={state ? 'Select LGA' : 'Select a state first'} disabled={!state} error={formState.errors.lga?.message} />
          )}
        />
        {field('ward', 'Ward')}
        <Controller
          control={control}
          name="deliveryAvailability"
          render={({ field: { value, onChange } }) => (
            <View style={styles.switchRow}>
              <View style={styles.flex}>
                <Text weight="medium" color={colors.gray900}>
                  Delivery available
                </Text>
                <Text size="xs" color={colors.gray500}>
                  Customers can request home delivery
                </Text>
              </View>
              <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary, false: colors.gray300 }} accessibilityLabel="Delivery available" />
            </View>
          )}
        />
        <View style={styles.actions}>
          <Button title="Cancel" variant="outline" style={styles.flex} disabled={update.isPending} onPress={() => setEditing(false)} />
          <Button title="Save" loadingTitle="Saving..." variant="gradient" style={styles.flex} loading={update.isPending} disabled={!online} onPress={onSave} />
        </View>
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  actions: { flexDirection: 'row', gap: 8 },
});
