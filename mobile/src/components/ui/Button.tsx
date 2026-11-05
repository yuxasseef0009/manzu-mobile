import { LinearGradient } from 'expo-linear-gradient';
import { Loader2 } from 'lucide-react-native';
import type { ComponentType, ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, gradients, radius, shadows, touchTarget } from '@/theme';

import { Text } from './Text';

// Mirrors components/ui/button.jsx variants plus the portal's gradient CTA.
export type ButtonVariant = 'default' | 'gradient' | 'logout' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg';

interface IconProps {
  size?: number;
  color?: string;
}

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  loadingTitle?: string;
  icon?: ComponentType<IconProps>;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  children?: ReactNode;
}

const HEIGHT: Record<ButtonSize, number> = { sm: touchTarget, default: touchTarget, lg: 52 };

const FG: Record<ButtonVariant, string> = {
  default: colors.white,
  gradient: colors.white,
  logout: colors.white,
  destructive: colors.white,
  outline: colors.gray700,
  secondary: colors.gray900,
  ghost: colors.brandBlue,
  link: colors.primary,
};

export function Button({
  title,
  onPress,
  variant = 'default',
  size = 'default',
  disabled,
  loading,
  loadingTitle,
  icon: Icon,
  fullWidth,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const fg = FG[variant];
  const label = loading && loadingTitle ? loadingTitle : title;
  const gradient = variant === 'gradient' ? gradients.brand : variant === 'logout' ? gradients.logout : null;

  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator size="small" color={fg} />
      ) : Icon ? (
        <Icon size={size === 'lg' ? 20 : 16} color={fg} />
      ) : null}
      {label ? (
        <Text size={size === 'lg' ? 'base' : 'sm'} weight={variant === 'gradient' || variant === 'logout' ? 'bold' : 'medium'} color={fg}>
          {label}
        </Text>
      ) : null}
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      style={({ pressed }) => [
        styles.base,
        { minHeight: HEIGHT[size] },
        variantStyles[variant],
        (variant === 'gradient' || variant === 'logout') && shadows.md,
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && (variant === 'default' ? { backgroundColor: colors.primaryDark } : styles.pressed),
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {gradient ? (
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.gradient, { minHeight: HEIGHT[size] }]}>
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </Pressable>
  );
}

export { Loader2 as ButtonSpinnerIcon };

const styles = StyleSheet.create({
  base: { borderRadius: radius.lg, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  gradient: { alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16 },
  fullWidth: { alignSelf: 'stretch' },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
});

const variantStyles = StyleSheet.create({
  default: { backgroundColor: colors.primary },
  gradient: {},
  logout: {},
  destructive: { backgroundColor: colors.danger },
  outline: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  secondary: { backgroundColor: colors.gray100 },
  ghost: { backgroundColor: 'transparent' },
  link: { backgroundColor: 'transparent' },
});
