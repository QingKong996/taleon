import { Pressable, StyleSheet, View } from 'react-native';

import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type OutlineIdeaCardProps = {
  disabled: boolean;
  idea: string;
  onEdit: () => void;
};

export function OutlineIdeaCard({
  disabled,
  idea,
  onEdit,
}: OutlineIdeaCardProps) {
  const theme = useTheme();

  return (
    <Surface radius={Radius.control} style={styles.card}>
      <View style={styles.header}>
        <View
          style={[styles.statusDot, { backgroundColor: theme.accent }]}
        />
        <ThemedText type="smallBold" style={styles.label}>
          你的故事
        </ThemedText>
        <Pressable
          accessibilityLabel="修改故事想法"
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          hitSlop={8}
          onPress={onEdit}
          style={({ pressed }) => pressed && styles.pressed}>
          <ThemedText type="smallBold" themeColor="accent">
            修改
          </ThemedText>
        </Pressable>
      </View>
      <ThemedText numberOfLines={2} style={styles.text}>
        {idea}
      </ThemedText>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 5,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  label: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  text: {
    fontSize: 13,
    lineHeight: 19,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  pressed: {
    opacity: 0.62,
  },
});
