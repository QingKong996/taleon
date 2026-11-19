import {
  StyleSheet,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';

import { TextField } from '@/components/ui/form';
import { useScrubbableNumberField } from '@/components/ui/use-scrubbable-number-field';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScrubbableNumberFieldProps = {
  accessibilityLabel?: string;
  compact?: boolean;
  disabled?: boolean;
  label: string;
  max: number;
  maxLength: number;
  min: number;
  onChange: (value: number) => void;
  pixelsPerStep?: number;
  step?: number;
  suffix: string;
  textStyle?: StyleProp<TextStyle>;
  value: number;
};

const FIELD_BACKGROUND = 'rgba(127, 127, 127, 0.12)';

export function ScrubbableNumberField({
  accessibilityLabel,
  compact = false,
  disabled = false,
  label,
  max,
  maxLength,
  min,
  onChange,
  pixelsPerStep,
  step,
  suffix,
  textStyle,
  value,
}: ScrubbableNumberFieldProps) {
  const theme = useTheme();
  const field = useScrubbableNumberField({
    disabled,
    max,
    maxLength,
    min,
    onChange,
    pixelsPerStep,
    step,
    value,
  });
  const trailing = (
    <ThemedText
      type="small"
      themeColor="textSecondary"
      style={compact && styles.compactSuffix}>
      {suffix}
    </ThemedText>
  );
  const fieldLabel = (
    <ThemedText
      type="small"
      themeColor="textSecondary"
      style={[styles.label, compact && styles.compactLabel]}>
      {label}
    </ThemedText>
  );

  if (field.isEditing) {
    return (
      <View style={[styles.field, compact && styles.compactField]}>
        {fieldLabel}
        <TextField
          accessibilityLabel={accessibilityLabel ?? label}
          autoFocus
          editable={!disabled}
          frameStyle={[
            styles.frame,
            compact && styles.compactFrame,
            { borderColor: theme.accent },
          ]}
          keyboardType="number-pad"
          maxLength={maxLength}
          onBlur={field.commitDraft}
          onChangeText={field.updateDraft}
          onFocus={field.beginDraft}
          onSubmitEditing={field.commitDraft}
          returnKeyType="done"
          selectTextOnFocus
          style={[textStyle, compact && styles.compactInput]}
          trailing={trailing}
          value={field.draft ?? String(value)}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.field,
        compact && styles.compactField,
        disabled && styles.disabled,
      ]}>
      {fieldLabel}
      <GestureDetector gesture={field.fieldGesture}>
        <View
          accessibilityActions={
            disabled
              ? []
              : [
                  { name: 'increment', label: '增加' },
                  { name: 'decrement', label: '减少' },
                ]
          }
          accessibilityHint="点击输入，长按后上下滑动调整"
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityRole="adjustable"
          accessibilityState={{ disabled }}
          accessibilityValue={{
            max,
            min,
            now: value,
            text: `${value}${suffix}`,
          }}
          onAccessibilityAction={(event) => {
            if (event.nativeEvent.actionName === 'increment') {
              field.adjustByStep(1);
            } else if (event.nativeEvent.actionName === 'decrement') {
              field.adjustByStep(-1);
            }
          }}>
          <View
            style={[
              styles.frame,
              styles.valueFrame,
              compact && styles.compactFrame,
              compact && styles.compactValueFrame,
              {
                backgroundColor: field.isScrubbing
                  ? theme.accentSoft
                  : FIELD_BACKGROUND,
                borderWidth: field.isScrubbing ? 1 : 0,
                borderColor: field.isScrubbing
                  ? theme.accent
                  : 'transparent',
              },
            ]}>
            <ThemedText style={[styles.value, textStyle]}>
              {value}
            </ThemedText>
            {trailing}
          </View>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 5,
  },
  compactField: {
    gap: 3,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
  },
  compactLabel: {
    fontSize: 11,
    lineHeight: 15,
  },
  frame: {
    borderWidth: 1,
    borderRadius: Radius.control,
    minHeight: 42,
  },
  compactFrame: {
    minHeight: 32,
    paddingHorizontal: 8,
  },
  compactInput: {
    minHeight: 32,
    paddingVertical: 5,
  },
  valueFrame: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  compactValueFrame: {
    gap: 5,
    paddingHorizontal: 8,
  },
  compactSuffix: {
    fontSize: 11,
    lineHeight: 15,
  },
  value: {
    flex: 1,
    fontVariant: ['tabular-nums'],
  },
  disabled: {
    opacity: 0.55,
  },
});
