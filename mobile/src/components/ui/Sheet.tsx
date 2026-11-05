import { X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius } from '@/theme';

import { Text } from './Text';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Block backdrop/back dismissal (e.g. while a request is in flight). */
  locked?: boolean;
}

// Bottom sheet replacing the web's centred modal dialogs (bg-black/50, rounded-xl, shadow-2xl).
export function Sheet({ visible, onClose, title, children, locked }: SheetProps) {
  const insets = useSafeAreaInsets();
  const close = () => {
    if (!locked) onClose();
  };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <Pressable style={styles.backdrop} onPress={close} disabled={locked} accessibilityRole="button" accessibilityLabel="Close" />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.handle} />
          {title ? (
            <View style={styles.header}>
              <Text size="lg" weight="bold" color={colors.gray900} style={styles.flex}>
                {title}
              </Text>
              <Pressable onPress={close} disabled={locked} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
                <X size={20} color={colors.gray500} />
              </Pressable>
            </View>
          ) : null}
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" bounces={false}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { marginTop: 'auto', maxHeight: '90%', backgroundColor: colors.white, borderTopLeftRadius: radius['2xl'], borderTopRightRadius: radius['2xl'] },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.gray300, marginTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 12 },
  content: { padding: 20, gap: 16 },
});
