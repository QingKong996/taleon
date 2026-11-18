import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ThemePreference } from '@/providers/theme-preference';

const APPEARANCE_OPTIONS = [
  {
    value: 'system',
    label: '跟随系统',
    ios: 'circle.lefthalf.filled',
    android: 'contrast',
  },
  {
    value: 'light',
    label: '浅色',
    ios: 'sun.max.fill',
    android: 'light_mode',
  },
  {
    value: 'dark',
    label: '深色',
    ios: 'moon.fill',
    android: 'dark_mode',
  },
] as const satisfies readonly {
  android: string;
  ios: string;
  label: string;
  value: ThemePreference;
}[];

type AppearancePickerProps = {
  onChange: (preference: ThemePreference) => void;
  value: ThemePreference;
};

export function AppearancePicker({
  onChange,
  value,
}: AppearancePickerProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityLabel="外观"
      style={[
        styles.track,
        { backgroundColor: theme.backgroundSelected },
      ]}>
      {APPEARANCE_OPTIONS.map((option) => {
        const isSelected = value === option.value;

        return (
          <Pressable
            accessibilityLabel={option.label}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.segment,
              isSelected && { backgroundColor: theme.accentSoft },
              pressed && styles.pressed,
            ]}>
            <SymbolView
              name={{ ios: option.ios, android: option.android }}
              size={13}
              tintColor={isSelected ? theme.accent : theme.textSecondary}
            />
            <ThemedText
              type="smallBold"
              themeColor={isSelected ? 'accent' : 'textSecondary'}
              style={styles.label}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: 2,
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 3,
    borderRadius: Radius.control,
  },
  segment: {
    flex: 1,
    minHeight: 34,
    paddingHorizontal: 4,
    borderRadius: Radius.compact,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.65,
  },
});
