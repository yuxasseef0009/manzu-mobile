import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Pencil } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { errorMessage } from '@/api/errors';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Text } from '@/components/ui';
import { GpsCaptureCard } from '@/features/location/GpsCaptureCard';
import { LocationMap } from '@/features/location/LocationMap';
import { useGpsCapture } from '@/features/location/useGpsCapture';
import { useIsOnline } from '@/lib/network';
import { colors } from '@/theme';

import { useUpdateProfile } from '../hooks';
import { coordinatesSchema, type CoordinatesFormValues } from '../schemas';
import type { ProfileResponse } from '../types';
import { buildProfilePayload, parseCoordinate } from '../utils';
import { InfoRow } from './InfoRow';

// Web "Location" tab: address + coordinates; managers can recapture GPS or type coordinates.
export function LocationTab({ profile, manager }: { profile: ProfileResponse; manager: boolean }) {
  const online = useIsOnline();
  const { pharmacy } = profile;
  const lat = parseCoordinate(pharmacy.latitude);
  const lng = parseCoordinate(pharmacy.longitude);
  const [editing, setEditing] = useState(false);
  const gps = useGpsCapture();
  const update = useUpdateProfile();
  const { control, handleSubmit, formState, reset, setValue } = useForm<CoordinatesFormValues>({
    resolver: zodResolver(coordinatesSchema),
    defaultValues: { latitude: lat?.toString() ?? '', longitude: lng?.toString() ?? '' },
  });

  useEffect(() => {
    if (gps.status === 'done' && gps.fix) {
      setValue('latitude', gps.fix.latitude.toFixed(6), { shouldValidate: true });
      setValue('longitude', gps.fix.longitude.toFixed(6), { shouldValidate: true });
    }
  }, [gps.status, gps.fix, setValue]);

  const startEdit = () => {
    reset({ latitude: lat?.toString() ?? '', longitude: lng?.toString() ?? '' });
    gps.reset();
    setEditing(true);
  };

  const onSave = handleSubmit((v) => {
    update.mutate(buildProfilePayload(profile, { pharmacy: { latitude: Number(v.latitude), longitude: Number(v.longitude) } }), {
      onSuccess: () => {
        setEditing(false);
        gps.reset();
        Toast.show({ type: 'success', text1: 'Location updated successfully' });
      },
      onError: (err) => Toast.show({ type: 'error', text1: errorMessage(err) || 'Failed to update location' }),
    });
  });

  return (
    <Card>
      <CardHeader tinted>
        <View style={styles.flex}>
          <CardTitle>Location</CardTitle>
        </View>
        {manager && !editing ? <Button title="Update" icon={Pencil} size="sm" variant="outline" onPress={startEdit} /> : null}
      </CardHeader>
      <CardContent>
        <InfoRow icon={MapPin} label="Address" value={[pharmacy.address, pharmacy.ward, pharmacy.lga, pharmacy.state].filter(Boolean).join(', ')} />
        {lat !== null && lng !== null ? (
          <LocationMap latitude={lat} longitude={lng} title={pharmacy.name} />
        ) : (
          <Text size="sm" color={colors.orange600}>
            No GPS coordinates set. Customers may not find your pharmacy in nearby searches.
          </Text>
        )}

        {editing ? (
          <>
            <GpsCaptureCard gps={gps} disabled={update.isPending} actionTitle="Use My Current Location" />
            <View style={styles.actions}>
              <Controller control={control} name="latitude" render={({ field: { value, onChange } }) => <View style={styles.flex}><Input label="Latitude" value={value} onChangeText={onChange} keyboardType="numbers-and-punctuation" error={formState.errors.latitude?.message} /></View>} />
              <Controller control={control} name="longitude" render={({ field: { value, onChange } }) => <View style={styles.flex}><Input label="Longitude" value={value} onChangeText={onChange} keyboardType="numbers-and-punctuation" error={formState.errors.longitude?.message} /></View>} />
            </View>
            <View style={styles.actions}>
              <Button
                title="Cancel"
                variant="outline"
                style={styles.flex}
                disabled={update.isPending}
                onPress={() => {
                  gps.reset();
                  setEditing(false);
                }}
              />
              <Button title="Save Location" loadingTitle="Saving..." variant="gradient" style={styles.flex} loading={update.isPending} disabled={!online || gps.capturing} onPress={onSave} />
            </View>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  actions: { flexDirection: 'row', gap: 8 },
});
