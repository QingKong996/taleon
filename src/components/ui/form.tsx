import type { PropsWithChildren, ReactNode } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { SectionHeader } from '@/components/ui/section-header';
import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Layout, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FormFieldProps = PropsWithChildren<{
  label: string;
}>;

export function FormField({ children, label }: FormFieldProps) {
  return (
    <View style={styles.field}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      {children}
    </View>
  );
}

type FormSectionProps = PropsWithChildren<{
  title: string;
}>;

export function FormSection({ children, title }: FormSectionProps) {
  return (
    <View style={styles.section}>
      <SectionHeader title={title} />
      <Surface radius={Radius.panel} style={styles.sectionSurface}>
        {children}
      </Surface>
    </View>
  );
}

type TextFieldProps = TextInputProps & {
  frameStyle?: StyleProp<ViewStyle>;
  label?: string;
  mono?: boolean;
  trailing?: ReactNode;
};

export function TextField({
  frameStyle,
  label,
  mono = false,
  style,
  trailing,
  ...inputProps
}: TextFieldProps) {
  const theme = useTheme();
  const field = (
    <View
      style={[
        styles.inputFrame,
        trailing ? styles.inputFrameWithTrailing : undefined,
        frameStyle,
      ]}>
      <TextInput
        placeholderTextColor={theme.textSecondary}
        selectionColor={theme.accent}
        style={[
          styles.input,
          mono && styles.monoInput,
          { color: theme.text },
          style,
        ]}
        {...inputProps}
      />
      {trailing}
    </View>
  );

  return label ? <FormField label={label}>{field}</FormField> : field;
}

const styles = StyleSheet.create({
  field: {
    gap: 7,
  },
  section: {
    gap: Layout.sectionGap,
  },
  sectionSurface: {
    padding: Layout.cardPadding,
    gap: 16,
  },
  inputFrame: {
    minHeight: 42,
    borderRadius: Radius.control,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(127, 127, 127, 0.12)',
  },
  inputFrameWithTrailing: {
    paddingRight: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 42,
    paddingVertical: 9,
    fontSize: 15,
    lineHeight: 20,
  },
  monoInput: {
    fontFamily: Fonts.mono,
    fontSize: 14,
    lineHeight: 19,
  },
});
