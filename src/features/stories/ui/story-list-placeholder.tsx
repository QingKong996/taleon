import { StyleSheet } from 'react-native';

import { Spinner } from '@/components/gluestack/spinner';
import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type StoryListPlaceholderProps = {
  loading: boolean;
};

export function StoryListPlaceholder({
  loading,
}: StoryListPlaceholderProps) {
  const theme = useTheme();

  return (
    <Surface style={styles.card}>
      {loading ? (
        <>
          <Spinner color={theme.accent} size="small" />
          <ThemedText type="small" themeColor="textSecondary">
            正在读取故事
          </ThemedText>
        </>
      ) : (
        <>
          <ThemedText type="smallBold">还没有故事</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            点击右下角按钮，从一个想法开始。
          </ThemedText>
        </>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 128,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
