import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import type { StoryOutlineChapter } from '@/features/workspace/model/workbench-data';
import { formatMissingChapters } from '@/features/workspace/ui/outline/outline-format';
import { OutlinePreview } from '@/features/workspace/ui/outline/outline-preview';

type OutlineResultSectionProps = {
  canUndoOutline: boolean;
  chapters: readonly StoryOutlineChapter[];
  disabled: boolean;
  displayRangeLabel: string;
  expectedChapterCount: number;
  generatingSectionsChapter: number | null;
  hasPreview: boolean;
  missingChapterNumbers: readonly number[];
  onApplyOutlineDraft: () => void;
  onDiscardPreview: () => void;
  onEditChapter: (chapterNumber: number) => void;
  onEditSection: (
    chapterNumber: number,
    sectionIndex: number,
  ) => void;
  onGenerateSections: (
    chapterNumber: number,
    sectionCount: number,
  ) => void;
  onUndoOutline: () => void;
  previewChapterCount: number;
  previewExpectedCount: number;
};

export function OutlineResultSection({
  canUndoOutline,
  chapters,
  disabled,
  displayRangeLabel,
  expectedChapterCount,
  generatingSectionsChapter,
  hasPreview,
  missingChapterNumbers,
  onApplyOutlineDraft,
  onDiscardPreview,
  onEditChapter,
  onEditSection,
  onGenerateSections,
  onUndoOutline,
  previewChapterCount,
  previewExpectedCount,
}: OutlineResultSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <ThemedText type="smallBold">
            {hasPreview ? '生成结果' : '当前大纲'}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {hasPreview
              ? `${displayRangeLabel} · 已解析 ${previewChapterCount}/${previewExpectedCount} 章`
              : `已生成 ${chapters.length}/${expectedChapterCount} 章`}
          </ThemedText>
        </View>
        <View style={styles.actions}>
          {hasPreview ? (
            <>
              <Button
                disabled={disabled}
                label="撤销"
                onPress={onDiscardPreview}
                size="compact"
                variant="secondary"
              />
              <Button
                disabled={disabled}
                label={
                  previewChapterCount === previewExpectedCount
                    ? '应用'
                    : `应用 ${previewChapterCount} 章`
                }
                onPress={onApplyOutlineDraft}
                size="compact"
              />
            </>
          ) : canUndoOutline ? (
            <Button
              disabled={disabled}
              label="撤销"
              onPress={onUndoOutline}
              size="compact"
              variant="secondary"
            />
          ) : null}
        </View>
      </View>

      {hasPreview &&
      !disabled &&
      missingChapterNumbers.length > 0 ? (
        <ThemedText
          type="small"
          themeColor="textSecondary"
          style={styles.partialHint}>
          缺少章节：
          {formatMissingChapters(missingChapterNumbers)}
        </ThemedText>
      ) : null}

      <OutlinePreview
        chapters={chapters}
        disabled={disabled}
        generatingSectionsChapter={generatingSectionsChapter}
        onEditChapter={hasPreview ? undefined : onEditChapter}
        onEditSection={hasPreview ? undefined : onEditSection}
        onGenerateSections={
          hasPreview ? undefined : onGenerateSections
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  heading: {
    flex: 1,
    gap: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  partialHint: {
    fontSize: 11,
    lineHeight: 16,
  },
});
