import { StyleSheet, View } from 'react-native';

import { TabScrollView } from '@/components/tab-scroll-view';
import { SectionHeader } from '@/components/ui/section-header';
import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';

const STORIES = [
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

export function StoriesScreen() {
  return (
    <TabScrollView>
      <ThemedText type="title">故事</ThemedText>

      <View style={styles.section}>
        <SectionHeader title="全部故事" />
        <View style={styles.storyList}>
          {STORIES.map((story) => (
            <Surface key={story.id} radius={Radius.card} style={styles.row}>
              <View
                style={[
                  styles.cover,
                  { backgroundColor: story.color },
                ]}>
                <ThemedText style={styles.coverMark}>
                  {story.mark}
                </ThemedText>
              </View>

              <View style={styles.copy}>
                <ThemedText type="smallBold">{story.title}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {story.meta}
                </ThemedText>
              </View>
            </Surface>
          ))}
        </View>
      </View>
    </TabScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  storyList: {
    gap: 8,
  },
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
