import { SymbolView } from 'expo-symbols';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Layout, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CreateStoryButtonProps = {
  creating: boolean;
  onCreate: () => void;
};

export function CreateStoryButton({
  creating,
  onCreate,
}: CreateStoryButtonProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityLabel="创建故事"
      accessibilityRole="button"
      accessibilityState={{ busy: creating, disabled: creating }}
      disabled={creating}
      onPress={onCreate}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme.accent,
          bottom: insets.bottom + Spacing.four,
        },
        pressed && styles.pressed,
        creating && styles.disabled,
      ]}>
      {creating ? (
        <ActivityIndicator color={theme.background} size="small" />
      ) : (
        <SymbolView
          name={{ android: 'add', ios: 'plus' }}
          size={18}
          tintColor={theme.background}
        />
      )}
      <ThemedText
        type="smallBold"
        style={[styles.label, { color: theme.background }]}>
        创建故事
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: Layout.screenPadding,
    minHeight: 48,
    borderRadius: Radius.pill,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.62,
  },
  disabled: {
    opacity: 0.72,
  },
});
