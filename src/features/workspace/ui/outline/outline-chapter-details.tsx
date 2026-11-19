import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { StoryOutlineChapter } from '@/features/workspace/model/workbench-data';
import { OutlineSectionGenerator } from '@/features/workspace/ui/outline/outline-section-generator';
import { OutlineSectionRow } from '@/features/workspace/ui/outline/outline-section-row';
import { useTheme } from '@/hooks/use-theme';

type OutlineChapterDetailsProps = {
  chapter: StoryOutlineChapter;
  disabled: boolean;
  generatingSections: boolean;
  onChangeSectionCount: (value: number) => void;
  onEditChapter?: (chapterNumber: number) => void;
  onEditSection?: (
    chapterNumber: number,
    sectionIndex: number,
  ) => void;
  onGenerateSections?: (
    chapterNumber: number,
    sectionCount: number,
  ) => void;
  sectionCount: number;
};

export function OutlineChapterDetails({
  chapter,
  disabled,
  generatingSections,
  onChangeSectionCount,
  onEditChapter,
  onEditSection,
  onGenerateSections,
  sectionCount,
}: OutlineChapterDetailsProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.sections,
        { borderTopColor: theme.backgroundSelected },
      ]}>
      {onEditChapter ? (
        <View style={styles.chapterEditRow}>
          <ThemedText type="small" themeColor="textSecondary">
            章名与大纲
          </ThemedText>
          <Pressable
            accessibilityLabel={`编辑第 ${chapter.chapterNumber} 章`}
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            disabled={disabled}
            hitSlop={8}
            onPress={() => onEditChapter(chapter.chapterNumber)}
            style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText
              type="smallBold"
              themeColor={disabled ? 'textSecondary' : 'accent'}>
              编辑
            </ThemedText>
          </Pressable>
        </View>
      ) : null}

      {chapter.sections.length > 0 ? (
        chapter.sections.map((section, index) => (
          <OutlineSectionRow
            chapterNumber={chapter.chapterNumber}
            disabled={disabled}
            index={index}
            key={`${chapter.chapterNumber}-${index}`}
            onEdit={onEditSection}
            section={section}
          />
        ))
      ) : (
        <ThemedText type="small" themeColor="textSecondary">
          尚未生成节大纲
        </ThemedText>
      )}

      {onGenerateSections ? (
        <OutlineSectionGenerator
          disabled={disabled}
          generating={generatingSections}
          hasSections={chapter.sections.length > 0}
          onChangeSectionCount={onChangeSectionCount}
          onGenerate={() =>
            onGenerateSections(chapter.chapterNumber, sectionCount)
          }
          sectionCount={sectionCount}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sections: {
    gap: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingTop: 9,
    paddingBottom: 10,
  },
  chapterEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pressed: {
    opacity: 0.62,
  },
});
