import type { TextProps } from 'react-native';

import { Text } from '@/components/gluestack/text';
import { Fonts, type ThemeColor } from '@/constants/theme';

type TextType =
  | 'default'
  | 'title'
  | 'small'
  | 'smallBold'
  | 'subtitle'
  | 'link'
  | 'linkPrimary'
  | 'code';

type ThemedTextProps = TextProps & {
  type?: TextType;
  themeColor?: ThemeColor;
};

const TYPE_CLASSNAMES: Record<TextType, string> = {
  default: 'font-medium text-base leading-6',
  title: 'font-medium text-[30px] leading-9 tracking-[0.2px]',
  small: 'font-normal text-sm leading-5',
  smallBold: 'font-semibold text-sm leading-5',
  subtitle: 'font-semibold text-[26px] leading-8',
  link: 'text-sm leading-[30px]',
  linkPrimary: 'text-sm leading-[30px] text-[#3c87f7]',
  code: 'text-xs font-medium android:font-bold',
};

const COLOR_CLASSNAMES: Partial<Record<ThemeColor, string>> = {
  accent: 'text-primary',
  success: 'text-success',
  text: 'text-foreground',
  textSecondary: 'text-muted-foreground',
};

export function ThemedText({
  style,
  type = 'default',
  themeColor = 'text',
  ...rest
}: ThemedTextProps) {
  const colorClassName =
    type === 'linkPrimary'
      ? undefined
      : (COLOR_CLASSNAMES[themeColor] ?? 'text-foreground');

  return (
    <Text
      className={`${TYPE_CLASSNAMES[type]} ${colorClassName ?? ''}`.trim()}
      style={[type === 'code' ? { fontFamily: Fonts.mono } : null, style]}
      {...rest}
    />
  );
}
