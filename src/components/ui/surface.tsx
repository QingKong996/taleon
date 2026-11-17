import type { PropsWithChildren } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SurfaceProps = PropsWithChildren<
  ViewProps & {
    radius?: number;
    selected?: boolean;
  }
>;

export function Surface({
  children,
  radius = Radius.card,
  selected = false,
  style,
  ...rest
}: SurfaceProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.surface,
        {
          backgroundColor: selected
            ? theme.accentSoft
            : theme.backgroundElement,
          borderColor: selected ? theme.accent : theme.backgroundSelected,
          borderRadius: radius,
        },
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
}

type PressableSurfaceProps = Omit<PressableProps, 'style'> & {
  radius?: number;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PressableSurface({
  children,
  radius = Radius.card,
  selected = false,
  style,
  ...rest
}: PressableSurfaceProps) {
  const theme = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.surface,
        {
          backgroundColor: selected
            ? theme.accentSoft
            : theme.backgroundElement,
          borderColor: selected ? theme.accent : theme.backgroundSelected,
          borderRadius: radius,
        },
        pressed && styles.pressed,
        style,
      ]}
      {...rest}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.62,
  },
});
