import { SymbolView } from 'expo-symbols';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import type {
  StoryOutlineChapter,
  StoryOutlineEntry,
  StoryOutlineSection,
} from '@/features/workspace/model/workbench-data';
import { OutlineEditorModal } from '@/features/workspace/ui/outline/outline-editor-modal';
import { formatMissingChapters } from '@/features/workspace/ui/outline/outline-format';
import { OutlineIdeaCard } from '@/features/workspace/ui/outline/outline-idea-card';
import { OutlinePlanCard } from '@/features/workspace/ui/outline/outline-plan-card';
import { OutlinePreview } from '@/features/workspace/ui/outline/outline-preview';
import { useOutlineWorkflow } from '@/features/workspace/ui/outline/use-outline-workflow';
import { useTheme } from '@/hooks/use-theme';

type OutlineStepProps = {
  appliedOutline: readonly StoryOutlineChapter[];
  canUndoOutline: boolean;
  chapterCount: number;
  chapterRange: [number, number];
  idea: string;
  onApplyChapterSections: (
    chapterNumber: number,
    sections: readonly StoryOutlineSection[],
  ) => boolean;
  onApplyOutline: (
    chapters: readonly StoryOutlineChapter[],
    range?: readonly [number, number],
  ) => boolean;
  onChangeChapterCount: (value: number) => void;
  onChangeChapterRange: (range: [number, number]) => void;
  onChangeWordsPerChapter: (value: number) => void;
  onEditIdea: () => void;
  onOpenChapter: () => void;
  onUpdateChapterOutline: (
    chapterNumber: number,
    changes: StoryOutlineEntry,
  ) => boolean;
  onUpdateSectionOutline: (
    chapterNumber: number,
    sectionIndex: number,
    changes: StoryOutlineEntry,
  ) => boolean;
  onUndoOutline: () => void;
  wordsPerChapter: number;
};

export function OutlineStep({
  appliedOutline,
  canUndoOutline,
  chapterCount,
  chapterRange,
  idea,
  onApplyChapterSections,
  onApplyOutline,
  onChangeChapterCount,
  onChangeChapterRange,
  onChangeWordsPerChapter,
  onEditIdea,
  onOpenChapter,
  onUpdateChapterOutline,
  onUpdateSectionOutline,
  onUndoOutline,
  wordsPerChapter,
}: OutlineStepProps) {
  const theme = useTheme();
  const workflow = useOutlineWorkflow({
    appliedOutline,
    chapterCount,
    chapterRange,
    idea,
    onApplyChapterSections,
    onApplyOutline,
    onUpdateChapterOutline,
    onUpdateSectionOutline,
    wordsPerChapter,
  });
  const selectedChapterCount =
    chapterRange[1] - chapterRange[0] + 1;

  return (
    <View style={styles.stepBody}>
      <View style={styles.intro}>
        <ThemedText type="subtitle" style={styles.introTitle}>
          故事大纲
        </ThemedText>
        <ThemedText type="small" style={styles.introCopy}>
          按范围生成章大纲，不自动生成节；展开章节后可指定节数生成。
        </ThemedText>
      </View>

      <OutlineIdeaCard
        disabled={workflow.isGenerating}
        idea={idea}
        onEdit={onEditIdea}
      />

      <OutlinePlanCard
        chapterCount={chapterCount}
        chapterRange={chapterRange}
        disabled={workflow.isGenerating}
        onChangeChapterCount={onChangeChapterCount}
        onChangeChapterRange={onChangeChapterRange}
        onChangeWordsPerChapter={onChangeWordsPerChapter}
        wordsPerChapter={wordsPerChapter}
      />

      <Button
        align="between"
        disabled={!workflow.canGenerate}
        label={
          workflow.isGeneratingOutline
            ? '正在生成大纲…'
            : `${workflow.displayedChapters.length > 0 ? '重新生成' : '生成'}${workflow.rangeLabel}大纲`
        }
        loading={workflow.isGeneratingOutline}
        onPress={() => {
          void workflow.generateOutlineDraft();
        }}
        size="compact"
        trailingIcon={
          <SymbolView
            name={{ ios: 'sparkles', android: 'auto_awesome' }}
            size={15}
            tintColor={
              workflow.canGenerate
                ? theme.background
                : theme.textSecondary
            }
          />
        }
      />

      {workflow.isGenerating ? (
        <View style={styles.generatingStatus}>
          <ActivityIndicator color={theme.accent} size="small" />
          <ThemedText type="small" themeColor="textSecondary">
            {workflow.generationLabel}
          </ThemedText>
        </View>
      ) : null}

      {workflow.displayedChapters.length > 0 ? (
        <View style={styles.resultSection}>
          <View style={styles.resultHeader}>
            <View style={styles.resultHeading}>
              <ThemedText type="smallBold">
                {workflow.hasPreview ? '生成结果' : '当前大纲'}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {workflow.hasPreview
                  ? `${workflow.displayRangeLabel} · 已解析 ${workflow.previewChapterCount}/${workflow.previewExpectedCount} 章`
                  : `已生成 ${workflow.displayedChapters.length}/${selectedChapterCount} 章`}
              </ThemedText>
            </View>
            <View style={styles.resultActions}>
              {workflow.hasPreview ? (
                <>
                  <Button
                    disabled={workflow.isGenerating}
                    label="撤销"
                    onPress={workflow.discardPreview}
                    size="compact"
                    variant="secondary"
                  />
                  <Button
                    disabled={workflow.isGenerating}
                    label={
                      workflow.previewChapterCount ===
                      workflow.previewExpectedCount
                        ? '应用'
                        : `应用 ${workflow.previewChapterCount} 章`
                    }
                    onPress={workflow.applyOutlineDraft}
                    size="compact"
                  />
                </>
              ) : canUndoOutline ? (
                <Button
                  disabled={workflow.isGenerating}
                  label="撤销"
                  onPress={onUndoOutline}
                  size="compact"
                  variant="secondary"
                />
              ) : null}
            </View>
          </View>

          {workflow.hasPreview &&
          !workflow.isGenerating &&
          workflow.missingChapterNumbers.length > 0 ? (
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.partialHint}>
              缺少章节：
              {formatMissingChapters(workflow.missingChapterNumbers)}
            </ThemedText>
          ) : null}

          <OutlinePreview
            chapters={workflow.displayedChapters}
            disabled={workflow.isGenerating}
            generatingSectionsChapter={
              workflow.generatingSectionsChapter
            }
            onEditChapter={
              workflow.hasPreview
                ? undefined
                : workflow.openChapterEditor
            }
            onEditSection={
              workflow.hasPreview
                ? undefined
                : workflow.openSectionEditor
            }
            onGenerateSections={
              workflow.hasPreview
                ? undefined
                : (chapterNumber, sectionCount) => {
                    void workflow.generateChapterSections(
                      chapterNumber,
                      sectionCount,
                    );
                  }
            }
          />
        </View>
      ) : !workflow.isGenerating ? (
        <View style={styles.emptyState}>
          <ThemedText type="small" themeColor="textSecondary">
            当前范围还没有生成大纲
          </ThemedText>
        </View>
      ) : null}

      <Button
        align="between"
        disabled={appliedOutline.length === 0 || workflow.isGenerating}
        label="进入章节内容"
        onPress={onOpenChapter}
        trailingIcon={
          <SymbolView
            name={{ ios: 'arrow.right', android: 'arrow_forward' }}
            size={16}
            tintColor={
              appliedOutline.length > 0 && !workflow.isGenerating
                ? theme.background
                : theme.textSecondary
            }
          />
        }
      />

      <OutlineEditorModal
        onClose={workflow.closeEditor}
        onSave={workflow.saveOutlineEditor}
        target={workflow.editorTarget}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stepBody: {
    gap: 12,
  },
  intro: {
    gap: 2,
  },
  introTitle: {
    fontSize: 20,
    lineHeight: 26,
  },
  introCopy: {
    fontSize: 13,
    lineHeight: 18,
  },
  generatingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 4,
  },
  resultSection: {
    gap: 7,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  resultHeading: {
    flex: 1,
    gap: 1,
  },
  resultActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  partialHint: {
    fontSize: 11,
    lineHeight: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});
