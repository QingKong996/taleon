import { SymbolView } from 'expo-symbols';

import { HStack } from '@/components/gluestack/hstack';
import { Pressable } from '@/components/gluestack/pressable';
import { Text } from '@/components/gluestack/text';
import type { ThemePreference } from '@/providers/theme-preference';
import { useTheme } from '@/hooks/use-theme';

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
    <HStack
      accessibilityLabel="外观"
      className="mx-3 mb-3 gap-0.5 rounded-control bg-border p-[3px]">
      {APPEARANCE_OPTIONS.map((option) => {
        const isSelected = value === option.value;

        return (
          <Pressable
            accessibilityLabel={option.label}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            className={[
              'min-h-[34px] flex-1 flex-row items-center justify-center gap-1 rounded-compact px-1',
              isSelected ? 'bg-accent' : 'bg-transparent',
              'data-[active=true]:opacity-[0.65]',
            ].join(' ')}
            key={option.value}
            onPress={() => onChange(option.value)}>
            <SymbolView
              name={{ ios: option.ios, android: option.android }}
              size={13}
              tintColor={isSelected ? theme.accent : theme.textSecondary}
            />
            <Text
              className={[
                'text-xs font-semibold leading-4',
                isSelected ? 'text-primary' : 'text-muted-foreground',
              ].join(' ')}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </HStack>
  );
}
