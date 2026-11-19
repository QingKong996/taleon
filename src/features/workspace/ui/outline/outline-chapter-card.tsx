import { StyleSheet } from 'react-native';

import { Surface } from '@/components/ui/surface';
import { Radius } from '@/constants/theme';
import type { StoryOutlineChapter } from '@/features/workspace/model/workbench-data';
import { OutlineChapterDetails } from '@/features/workspace/ui/outline/outline-chapter-details';
import { OutlineChapterHeader } from '@/features/workspace/ui/outline/outline-chapter-header';
import { useOutlineChapterState } from '@/features/workspace/ui/outline/use-outline-chapter-state';

type OutlineChapterCardProps = {
  chapter: StoryOutlineChapter;
  disabled: boolean;
  generatingSections: boolean;
  initiallyExpanded: boolean;
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

export function OutlineChapterCard({
  chapter,
  disabled,
  generatingSections,
  initiallyExpanded,
  onEditChapter,
  onEditSection,
  onGenerateSections,
}: OutlineChapterCardProps) {
  const state = useOutlineChapterState({
    initiallyExpanded,
    sections: chapter.sections,
  });
  const sectionLabel =
    chapter.sections.length > 0
      ? `${chapter.sections.length} 节`
      : '待生成节';

  return (
    <Surface radius={Radius.compact} style={styles.card}>
      <OutlineChapterHeader
        chapter={chapter}
        expanded={state.expanded}
        onToggle={state.toggleExpanded}
        sectionLabel={sectionLabel}
      />

      {state.expanded ? (
        <OutlineChapterDetails
          chapter={chapter}
          disabled={disabled}
          generatingSections={generatingSections}
          onChangeSectionCount={state.setSectionCount}
          onEditChapter={onEditChapter}
          onEditSection={onEditSection}
          onGenerateSections={onGenerateSections}
          sectionCount={state.sectionCount}
        />
      ) : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
