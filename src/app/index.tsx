import { StyleSheet, View } from 'react-native';

import { TabScrollView } from '@/components/tab-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

const stories = [
  {
    id: 'mist-harbor',
    title: '雾港来信',
    meta: '悬疑 · 第 12 章',
    mark: '雾',
    color: '#9B5D4B',
  },
  {
    id: 'star-traveler',
    title: '星海旅人',
    meta: '科幻 · 第 8 章',
    mark: '星',
    color: '#456D8A',
  },
  {
    id: 'long-night',
    title: '长夜将明',
    meta: '奇幻 · 第 3 章',
    mark: '夜',
    color: '#665386',
  },
] as const;

export default function StoriesScreen() {
  const theme = useTheme();

  return (
    <TabScrollView>
      <ThemedText type="title">故事</ThemedText>

      <ThemedText type="smallBold" style={styles.sectionLabel}>
        全部故事
      </ThemedText>

      <View style={styles.storyList}>
        {stories.map((story) => (
          <View
            key={story.id}
            style={[
              styles.storyRow,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.backgroundSelected,
              },
            ]}>
            <View style={[styles.storyCover, { backgroundColor: story.color }]}>
              <ThemedText style={styles.coverMark}>{story.mark}</ThemedText>
            </View>

            <View style={styles.storyCopy}>
              <ThemedText type="smallBold">{story.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {story.meta}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
    </TabScrollView>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 13,
    lineHeight: 18,
  },
  storyList: {
    gap: 8,
  },
  storyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    paddingRight: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  storyCover: {
    width: 42,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverMark: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: 600,
  },
  storyCopy: {
    flex: 1,
    gap: 2,
  },
});
