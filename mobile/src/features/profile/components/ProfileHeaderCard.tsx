import * as ImagePicker from 'expo-image-picker';
import { Camera, Store, Upload, X } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { errorMessage } from '@/api/errors';
import { Badge, Button, Card, CardContent, Text } from '@/components/ui';
import { useIsOnline } from '@/lib/network';
import { colors, radius } from '@/theme';

import { useUploadLogo } from '../hooks';
import type { LogoUploadFile, ProfileResponse } from '../types';

const MAX_LOGO_BYTES = 5 * 1024 * 1024;

const STATUS_VARIANT = { VERIFIED: 'success', PENDING: 'warning', REJECTED: 'destructive', SUSPENDED: 'destructive', CLOSED: 'secondary' } as const;

export function ProfileHeaderCard({ profile, manager }: { profile: ProfileResponse; manager: boolean }) {
  const online = useIsOnline();
  const upload = useUploadLogo();
  const [pending, setPending] = useState<LogoUploadFile | null>(null);
  const { pharmacy } = profile;
  const logoUri = pending?.uri ?? pharmacy.logoUrl;

  // Web handleLogoChange: image files only, max 5MB.
  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    const asset = result.canceled ? undefined : result.assets[0];
    if (!asset) return;
    if (asset.fileSize && asset.fileSize > MAX_LOGO_BYTES) {
      Toast.show({ type: 'error', text1: 'Image size must be less than 5MB' });
      return;
    }
    const type = asset.mimeType ?? 'image/jpeg';
    if (!type.startsWith('image/')) {
      Toast.show({ type: 'error', text1: 'Please select an image file' });
      return;
    }
    const ext = type.split('/')[1] ?? 'jpg';
    setPending({ uri: asset.uri, type, name: asset.fileName ?? `logo.${ext === 'jpeg' ? 'jpg' : ext}` });
  };

  const uploadLogo = () => {
    if (!pending) return;
    upload.mutate(pending, {
      onSuccess: () => {
        setPending(null);
        Toast.show({ type: 'success', text1: 'Logo updated successfully' });
      },
      onError: (err) => Toast.show({ type: 'error', text1: errorMessage(err) || 'Failed to upload logo' }),
    });
  };

  return (
    <Card elevated>
      <CardContent style={styles.content}>
        <View style={styles.row}>
          <Pressable onPress={manager ? () => void pickLogo() : undefined} disabled={!manager || upload.isPending} accessibilityRole={manager ? 'button' : 'image'} accessibilityLabel={manager ? 'Change pharmacy logo' : 'Pharmacy logo'} style={styles.logoWrap}>
            {logoUri ? <Image source={{ uri: logoUri }} style={styles.logo} resizeMode="cover" /> : <Store size={32} color={colors.gray400} />}
            {manager ? (
              <View style={styles.cameraBadge}>
                <Camera size={12} color={colors.white} />
              </View>
            ) : null}
          </Pressable>
          <View style={styles.flex}>
            <Text size="xl" weight="bold" color={colors.gray900} numberOfLines={2}>
              {pharmacy.name}
            </Text>
            <Text size="xs" color={colors.gray600}>
              License: {pharmacy.licenseNumber}
            </Text>
            <View style={styles.badges}>
              <Badge variant={STATUS_VARIANT[pharmacy.status]} label={pharmacy.status} />
              {pharmacy.pharmacyType ? <Badge variant="outline" label={pharmacy.pharmacyType} /> : null}
            </View>
          </View>
        </View>
        {pending ? (
          <View style={styles.actions}>
            <Button title="Cancel" icon={X} variant="outline" style={styles.flex} disabled={upload.isPending} onPress={() => setPending(null)} />
            <Button title="Upload Logo" loadingTitle="Uploading..." icon={Upload} variant="gradient" style={styles.flex} loading={upload.isPending} disabled={!online} onPress={uploadLogo} />
          </View>
        ) : null}
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 4 },
  content: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  logoWrap: { width: 72, height: 72, borderRadius: radius.xl, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 72, height: 72, borderRadius: radius.xl },
  cameraBadge: { position: 'absolute', right: -4, bottom: -4, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
});
