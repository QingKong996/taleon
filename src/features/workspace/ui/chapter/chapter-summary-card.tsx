import { StyleSheet, View } from 'react-native';

import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import {
  getCompletedSectionCount,
  isChapterContentComplete,
} from '@/features/workspace/model/content/chapter-content';
import type { StoryOutlineChapter } from '@/features/workspace/model/workbench-data';
import { useTheme } from '@/hooks/use-theme';

type ChapterSummaryCardProps = {
  chapter: StoryOutlineChapter;
};

export function ChapterSummaryCard({
  chapter,
}: ChapterSummaryCardProps) {
  const theme = useTheme();
  const isComplete = isChapterContentComplete(chapter);

  return (
    <Surface radius={Radius.card} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <ThemedText type="smallBold">
            第 {chapter.chapterNumber} 章 · {chapter.title}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {getCompletedSectionCount(chapter)}/{chapter.sections.length}{' '}
            节已完成
          </ThemedText>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isComplete
                ? theme.accentSoft
                : theme.background,
            },
          ]}>
          <ThemedText
            type="smallBold"
            themeColor={isComplete ? 'success' : 'textSecondary'}
            style={styles.statusText}>
            {isComplete ? '已完成' : '未完成'}
          </ThemedText>
        </View>
      </View>
      <ThemedText
        type="small"
        themeColor="textSecondary"
        style={styles.outline}>
        {chapter.outline}
      </ThemedText>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  statusBadge: {
    borderRadius: Radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    lineHeight: 15,
  },
  outline: {
    fontSize: 13,
    lineHeight: 19,
  },
});
