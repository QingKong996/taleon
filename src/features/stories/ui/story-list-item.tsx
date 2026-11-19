import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { PressableSurface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import type { StorySummary } from '@/features/stories/model/story-types';
import {
  getStoryCoverColor,
  getStoryCoverMark,
  getStoryMeta,
} from '@/features/stories/ui/story-summary-display';
import { useTheme } from '@/hooks/use-theme';

type StoryListItemProps = {
  onLongPress: () => void;
  onPress: () => void;
  story: StorySummary;
};

export function StoryListItem({
  onLongPress,
  onPress,
  story,
}: StoryListItemProps) {
  const theme = useTheme();

  return (
    <PressableSurface
      accessibilityHint="点击继续创作，长按编辑故事名称"
      accessibilityLabel={`继续${story.title}`}
      accessibilityRole="button"
      delayLongPress={450}
      onLongPress={onLongPress}
      onPress={onPress}
      radius={Radius.card}
      style={styles.row}>
      <View
        style={[
          styles.cover,
          { backgroundColor: getStoryCoverColor(story.id) },
        ]}>
        <ThemedText style={styles.coverMark}>
          {getStoryCoverMark(story)}
        </ThemedText>
      </View>

      <View style={styles.copy}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {story.title}
        </ThemedText>
        <ThemedText
          type="small"
          themeColor="textSecondary"
          numberOfLines={1}>
          {getStoryMeta(story)}
        </ThemedText>
      </View>

      <SymbolView
        name={{
          android: 'chevron_right',
          ios: 'chevron.right',
        }}
        size={16}
        tintColor={theme.textSecondary}
      />
    </PressableSurface>
  );
}

const styles = StyleSheet.create({
  row: {
    padding: 8,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cover: {
    width: 42,
    height: 56,
    borderRadius: Radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverMark: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: 600,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});
