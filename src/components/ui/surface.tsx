import type { PropsWithChildren } from 'react';
import {
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { Box } from '@/components/gluestack/box';
import { Pressable } from '@/components/gluestack/pressable';
import { Radius } from '@/constants/theme';

type SurfaceProps = PropsWithChildren<
  ViewProps & {
    radius?: number;
    selected?: boolean;
  }
>;

const SURFACE_CLASSNAMES =
  'border border-border bg-card rounded-card';
const SELECTED_SURFACE_CLASSNAMES =
  'border border-primary bg-accent rounded-card';

export function Surface({
  children,
  radius = Radius.card,
  selected = false,
  style,
  ...rest
}: SurfaceProps) {
  return (
    <Box
      className={selected ? SELECTED_SURFACE_CLASSNAMES : SURFACE_CLASSNAMES}
      style={[
        { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius },
        style,
      ]}
      {...rest}>
      {children}
    </Box>
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
  return (
    <Pressable
      className={[
        selected ? SELECTED_SURFACE_CLASSNAMES : SURFACE_CLASSNAMES,
        'data-[active=true]:opacity-[0.62]',
      ].join(' ')}
      style={[
        { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius },
        style,
      ]}
      {...rest}>
      {children}
    </Pressable>
  );
}
