import { Navigation } from 'lucide-react-native';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { Button, Text } from '@/components/ui';
import { colors, radius } from '@/theme';

interface Props {
  latitude: number;
  longitude: number;
  title?: string;
  height?: number;
}

export function openInMaps(latitude: number, longitude: number, label = 'Pharmacy') {
  const q = `${latitude},${longitude}`;
  const url = Platform.OS === 'ios' ? `https://maps.apple.com/?ll=${q}&q=${encodeURIComponent(label)}` : `geo:${q}?q=${q}(${encodeURIComponent(label)})`;
  void Linking.openURL(url).catch(() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`));
}

// Read-only preview; the web shows the coordinates with a Google Maps link.
export function LocationMap({ latitude, longitude, title = 'Pharmacy', height = 180 }: Props) {
  const region = { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
  return (
    <View style={styles.wrap}>
      <MapView style={[styles.map, { height }]} region={region} scrollEnabled={false} zoomEnabled={false} rotateEnabled={false} pitchEnabled={false} accessibilityLabel={`Map showing ${title}`}>
        <Marker coordinate={{ latitude, longitude }} title={title} pinColor={colors.primary} />
      </MapView>
      <View style={styles.row}>
        <Text size="xs" color={colors.gray600} style={styles.flex}>
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </Text>
        <Button title="Open in Maps" size="sm" variant="outline" icon={Navigation} onPress={() => openInMaps(latitude, longitude, title)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { gap: 8 },
  map: { width: '100%', borderRadius: radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
