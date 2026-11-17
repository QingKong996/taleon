import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type SelectableChipOption = {
  label: string;
  value: string;
};

type SelectableChipGroupProps = {
  onLongPress?: (value: string) => void;
  onRemove?: (value: string) => void;
  onToggle: (value: string) => void;
  options: readonly SelectableChipOption[];
  removable?: boolean;
  selectedValues: readonly string[];
};

export function SelectableChipGroup({
  onLongPress,
  onRemove,
  onToggle,
  options,
  removable,
  selectedValues,
}: SelectableChipGroupProps) {
  const theme = useTheme();

  return (
    <View style={styles.group}>
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);

        return (
          <View
            key={option.value}
            style={[
              styles.option,
              {
                backgroundColor: isSelected
                  ? theme.accentSoft
                  : theme.backgroundSelected,
                borderColor: isSelected ? theme.accent : 'transparent',
              },
            ]}>
            <Pressable
              accessibilityHint={onLongPress ? '长按编辑' : undefined}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onLongPress={
                onLongPress ? () => onLongPress(option.value) : undefined
              }
              onPress={() => onToggle(option.value)}
              style={({ pressed }) => [
                styles.optionButton,
                pressed && styles.pressed,
              ]}>
              <ThemedText
                numberOfLines={1}
                type="smallBold"
                themeColor={isSelected ? 'accent' : 'textSecondary'}
                style={styles.optionLabel}>
                {option.label}
              </ThemedText>
            </Pressable>

            {removable ? (
              <Pressable
                accessibilityLabel={`从列表移除 ${option.label}`}
                accessibilityRole="button"
                hitSlop={6}
                onPress={() => onRemove?.(option.value)}
                style={({ pressed }) => [
                  styles.removeButton,
                  pressed && styles.pressed,
                ]}>
                <SymbolView
                  name={{ ios: 'xmark', android: 'close' }}
                  size={11}
                  tintColor={isSelected ? theme.accent : theme.textSecondary}
                />
              </Pressable>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  option: {
    minHeight: 32,
    maxWidth: '100%',
    borderWidth: 1,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  optionButton: {
    minWidth: 0,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  removeButton: {
    width: 25,
    marginLeft: -5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.62,
  },
});
