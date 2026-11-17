import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonVariant = 'primary' | 'secondary' | 'soft';
type ButtonSize = 'compact' | 'regular';

type ButtonProps = {
  accessibilityLabel?: string;
  align?: 'between' | 'center';
  disabled?: boolean;
  label: string;
  labelStyle?: StyleProp<TextStyle>;
  leadingIcon?: ReactNode;
  loading?: boolean;
  onPress: () => void;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  trailingIcon?: ReactNode;
  variant?: ButtonVariant;
};

export function Button({
  accessibilityLabel,
  align = 'center',
  disabled = false,
  label,
  labelStyle,
  leadingIcon,
  loading = false,
  onPress,
  size = 'regular',
  style,
  trailingIcon,
  variant = 'primary',
}: ButtonProps) {
  const theme = useTheme();
  const palette = {
    primary: {
      backgroundColor: disabled ? theme.backgroundSelected : theme.accent,
      borderColor: 'transparent',
      color: disabled ? theme.textSecondary : theme.background,
    },
    secondary: {
      backgroundColor: theme.backgroundElement,
      borderColor: theme.backgroundSelected,
      color: disabled ? theme.textSecondary : theme.text,
    },
    soft: {
      backgroundColor: theme.accentSoft,
      borderColor: theme.accent,
      color: disabled ? theme.textSecondary : theme.accent,
    },
  }[variant];

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        size === 'compact' ? styles.compactButton : styles.regularButton,
        align === 'between' ? styles.between : styles.center,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
        },
        pressed && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={palette.color} size="small" />
      ) : (
        <>
          {leadingIcon}
          <ThemedText
            type="smallBold"
            style={[
              size === 'compact' ? styles.compactLabel : styles.regularLabel,
              { color: palette.color },
              labelStyle,
            ]}>
            {label}
          </ThemedText>
          {trailingIcon}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactButton: {
    minHeight: 32,
    borderRadius: Radius.compact,
    paddingHorizontal: 10,
    gap: 5,
  },
  regularButton: {
    minHeight: 46,
    borderRadius: Radius.control,
    paddingHorizontal: 16,
    gap: 8,
  },
  center: {
    justifyContent: 'center',
  },
  between: {
    justifyContent: 'space-between',
  },
  compactLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  regularLabel: {
    fontSize: 14,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.62,
  },
});
