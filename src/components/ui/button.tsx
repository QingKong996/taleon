import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import {
  Button as GluestackButton,
  ButtonSpinner,
  ButtonText,
} from '@/components/gluestack/button';
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

const VARIANT_CLASSNAMES: Record<ButtonVariant, string> = {
  primary: 'border-0 bg-primary',
  secondary: 'border border-border bg-muted',
  soft: 'border border-primary bg-accent',
};

const DISABLED_VARIANT_CLASSNAMES: Record<ButtonVariant, string> = {
  primary: 'border-0 bg-border',
  secondary: 'border border-border bg-card',
  soft: 'border border-primary bg-accent',
};

const TEXT_VARIANT_CLASSNAMES: Record<ButtonVariant, string> = {
  primary: 'text-primary-foreground',
  secondary: 'text-foreground',
  soft: 'text-accent-foreground',
};

const GLUESTACK_VARIANTS: Record<
  ButtonVariant,
  'default' | 'secondary' | 'ghost'
> = {
  primary: 'default',
  secondary: 'secondary',
  soft: 'ghost',
};

const SIZE_CLASSNAMES: Record<ButtonSize, string> = {
  compact: 'min-h-8 gap-1.5 rounded-compact px-2.5',
  regular: 'min-h-[46px] gap-2 rounded-control px-4',
};

const TEXT_SIZE_CLASSNAMES: Record<ButtonSize, string> = {
  compact: 'text-xs leading-4',
  regular: 'text-sm leading-5',
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
  const spinnerColor =
    disabled
      ? theme.textSecondary
      : variant === 'primary'
        ? theme.background
        : variant === 'soft'
          ? theme.accent
          : theme.text;

  return (
    <GluestackButton
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={[
        disabled
          ? DISABLED_VARIANT_CLASSNAMES[variant]
          : VARIANT_CLASSNAMES[variant],
        SIZE_CLASSNAMES[size],
        align === 'between' ? 'justify-between' : 'justify-center',
        'data-[disabled=true]:opacity-100',
      ].join(' ')}
      disabled={disabled || loading}
      onPress={onPress}
      size={size === 'compact' ? 'sm' : 'default'}
      style={style}
      variant={GLUESTACK_VARIANTS[variant]}>
      {loading ? (
        <ButtonSpinner color={spinnerColor} />
      ) : (
        <>
          {leadingIcon}
          <ButtonText
            className={[
              disabled
                ? 'text-muted-foreground'
                : TEXT_VARIANT_CLASSNAMES[variant],
              TEXT_SIZE_CLASSNAMES[size],
            ].join(' ')}
            style={labelStyle}>
            {label}
          </ButtonText>
          {trailingIcon}
        </>
      )}
    </GluestackButton>
  );
}
