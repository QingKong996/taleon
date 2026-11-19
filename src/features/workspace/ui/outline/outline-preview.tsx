import { StyleSheet, View } from 'react-native';

import type { StoryOutlineChapter } from '@/features/workspace/model/workbench-data';
import { OutlineChapterCard } from '@/features/workspace/ui/outline/outline-chapter-card';

type OutlinePreviewProps = {
  chapters: readonly StoryOutlineChapter[];
  disabled?: boolean;
  generatingSectionsChapter?: number | null;
  onEditChapter?: (chapterNumber: number) => void;
  onEditSection?: (
    chapterNumber: number,
    sectionIndex: number,
  ) => void;
  onGenerateSections?: (
    chapterNumber: number,
    sectionCount: number,
  ) => void;
};

export function OutlinePreview({
  chapters,
  disabled = false,
  generatingSectionsChapter = null,
  onEditChapter,
  onEditSection,
  onGenerateSections,
}: OutlinePreviewProps) {
  return (
    <View style={styles.list}>
      {chapters.map((chapter, index) => (
        <OutlineChapterCard
          chapter={chapter}
          disabled={disabled}
          generatingSections={
            generatingSectionsChapter === chapter.chapterNumber
          }
          initiallyExpanded={index === 0}
          key={chapter.chapterNumber}
          onEditChapter={onEditChapter}
          onEditSection={onEditSection}
          onGenerateSections={onGenerateSections}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 6,
  },
});
