import { SymbolView } from 'expo-symbols';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SearchFieldProps = {
  accessibilityLabel: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

export function SearchField({
  accessibilityLabel,
  onChangeText,
  placeholder,
  value,
}: SearchFieldProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.field,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.backgroundSelected,
        },
      ]}>
      <SymbolView
        name={{ ios: 'magnifyingglass', android: 'search' }}
        size={15}
        tintColor={theme.textSecondary}
      />
      <TextInput
        accessibilityLabel={accessibilityLabel}
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onChangeText}
        onSubmitEditing={Keyboard.dismiss}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        returnKeyType="search"
        selectionColor={theme.accent}
        style={[styles.input, { color: theme.text }]}
        value={value}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityLabel="清除搜索"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => onChangeText('')}>
          <SymbolView
            name={{ ios: 'xmark.circle.fill', android: 'cancel' }}
            size={16}
            tintColor={theme.textSecondary}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 40,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.control,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    lineHeight: 20,
  },
});
