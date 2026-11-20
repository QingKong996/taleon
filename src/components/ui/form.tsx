import type { PropsWithChildren, ReactNode } from 'react';
import {
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/gluestack/form-control';
import { Input, InputField, InputSlot } from '@/components/gluestack/input';
import { VStack } from '@/components/gluestack/vstack';
import { SectionHeader } from '@/components/ui/section-header';
import { Surface } from '@/components/ui/surface';
import { Fonts, Layout, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FormFieldProps = PropsWithChildren<{
  label: string;
}>;

export function FormField({ children, label }: FormFieldProps) {
  return (
    <FormControl className="gap-1.5">
      <FormControlLabel className="mb-0">
        <FormControlLabelText className="text-xs font-normal text-muted-foreground">
          {label}
        </FormControlLabelText>
      </FormControlLabel>
      {children}
    </FormControl>
  );
}

type FormSectionProps = PropsWithChildren<{
  title: string;
}>;

export function FormSection({ children, title }: FormSectionProps) {
  return (
    <VStack className="gap-2">
      <SectionHeader title={title} />
      <Surface
        radius={Radius.panel}
        style={{
          padding: Layout.cardPadding,
          gap: 16,
        }}>
        {children}
      </Surface>
    </VStack>
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
    <Input
      className={[
        'min-h-[42px] rounded-control border-0 bg-field px-3 shadow-none dark:bg-field',
        trailing ? 'gap-2 pr-2.5' : undefined,
      ]
        .filter(Boolean)
        .join(' ')}
      style={frameStyle}>
      <InputField
        className={[
          'text-[15px] leading-5 text-foreground placeholder:text-muted-foreground',
          mono ? 'text-sm' : undefined,
          inputProps.multiline ? 'h-auto' : undefined,
        ]
          .filter(Boolean)
          .join(' ')}
        placeholderTextColor={theme.textSecondary}
        selectionColor={theme.accent}
        style={[mono ? { fontFamily: Fonts.mono } : null, style]}
        {...inputProps}
      />
      {trailing ? <InputSlot>{trailing}</InputSlot> : null}
    </Input>
  );

  return label ? <FormField label={label}>{field}</FormField> : field;
}
