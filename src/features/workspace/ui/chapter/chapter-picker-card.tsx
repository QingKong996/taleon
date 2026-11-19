import { Host, Picker } from '@expo/ui';
import { StyleSheet, View } from 'react-native';

import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import {
  getCompletedSectionCount,
  isChapterContentComplete,
} from '@/features/workspace/model/content/chapter-content';
import type { StoryOutlineChapter } from '@/features/workspace/model/workbench-data';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

type ChapterPickerCardProps = {
  chapters: readonly StoryOutlineChapter[];
  disabled: boolean;
  onSelectChapter: (chapterNumber: number) => void;
  selectedChapterNumber: number;
};

export function ChapterPickerCard({
  chapters,
  disabled,
  onSelectChapter,
  selectedChapterNumber,
}: ChapterPickerCardProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme();

  return (
    <Surface radius={Radius.card} style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="smallBold">当前章</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          共 {chapters.length} 章
        </ThemedText>
      </View>
      <Host
        colorScheme={colorScheme}
        ignoreSafeArea="all"
        matchContents={{ vertical: true }}
        seedColor={theme.accent}
        style={styles.host}>
        <Picker
          accessibilityLabel="选择当前章节"
          enabled={!disabled}
          onValueChange={onSelectChapter}
          selectedValue={selectedChapterNumber}>
          {chapters.map((chapter) => {
            const progress = isChapterContentComplete(chapter)
              ? '已完成'
              : `${getCompletedSectionCount(chapter)}/${chapter.sections.length} 节`;

            return (
              <Picker.Item
                key={chapter.chapterNumber}
                label={`第 ${chapter.chapterNumber} 章 · ${chapter.title} · ${progress}`}
                value={chapter.chapterNumber}
              />
            );
          })}
        </Picker>
      </Host>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 6,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  host: {
    width: '100%',
  },
});
