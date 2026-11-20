import { SymbolView } from 'expo-symbols';
import { Keyboard } from 'react-native';

import { Input, InputField, InputSlot } from '@/components/gluestack/input';
import { Pressable } from '@/components/gluestack/pressable';
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
    <Input className="min-h-10 rounded-control border border-border bg-card px-3 shadow-none dark:bg-card">
      <InputSlot>
        <SymbolView
          name={{ ios: 'magnifyingglass', android: 'search' }}
          size={15}
          tintColor={theme.textSecondary}
        />
      </InputSlot>
      <InputField
        accessibilityLabel={accessibilityLabel}
        autoCapitalize="none"
        autoCorrect={false}
        className="text-[15px] leading-5 text-foreground placeholder:text-muted-foreground"
        onChangeText={onChangeText}
        onSubmitEditing={Keyboard.dismiss}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        returnKeyType="search"
        selectionColor={theme.accent}
        value={value}
      />
      {value.length > 0 ? (
        <InputSlot>
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
        </InputSlot>
      ) : null}
    </Input>
  );
}
