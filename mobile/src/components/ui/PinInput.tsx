import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors, fonts, radius } from '@/theme';

import { Text } from './Text';

interface PinInputProps {
  value: string;
  onChange: (pin: string) => void;
  length?: number;
  label?: string;
  error?: string;
  onSubmit?: () => void;
  secure?: boolean;
}

// Web login: six w-12 h-14 boxes, border-2, focus:border-[#1ABA7F], digits only.
// One hidden TextInput keeps paste/autofill/backspace behaviour native.
export function PinInput({ value, onChange, length = 6, label, error, onSubmit, secure = true }: PinInputProps) {
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState(false);
  const digits = value.split('');

  return (
    <View style={styles.field}>
      {label ? (
        <Text size="sm" weight="semibold" color={colors.gray700}>
          {label}
          <Text color={colors.red500}> *</Text>
        </Text>
      ) : null}
      <Pressable onPress={() => inputRef.current?.focus()} style={styles.row} accessibilityRole="button" accessibilityLabel={label ?? 'PIN'} accessibilityHint="Enter your 6-digit PIN">
        {Array.from({ length }, (_, i) => {
          const isActive = focused && (i === digits.length || (i === length - 1 && digits.length === length));
          const char = digits[i];
          return (
            <View key={i} style={[styles.box, isActive && styles.boxActive, !!error && styles.boxError]}>
              <Text size="2xl" weight="bold" color={colors.gray900}>
                {char ? (secure ? '•' : char) : ''}
              </Text>
            </View>
          );
        })}
      </Pressable>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onSubmitEditing={onSubmit}
        keyboardType="number-pad"
        textContentType="password"
        autoComplete="off"
        maxLength={length}
        secureTextEntry={secure}
        caretHidden
        style={styles.hidden}
        importantForAutofill="no"
      />
      {error ? (
        <Text size="xs" color={colors.red600}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  box: {
    width: 44,
    height: 52,
    borderWidth: 2,
    borderColor: colors.gray200,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  boxActive: { borderColor: colors.primary },
  boxError: { borderColor: colors.red500 },
  hidden: { position: 'absolute', opacity: 0, height: 1, width: 1, fontFamily: fonts.regular },
});
