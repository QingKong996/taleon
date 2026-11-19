import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import type {
  StoryOutlineChapter,
  StoryOutlineEntry,
  StoryOutlineSection,
} from '@/features/workspace/model/workbench-data';
import { OutlineEditorModal } from '@/features/workspace/ui/outline/outline-editor-modal';
import { OutlineGenerationControl } from '@/features/workspace/ui/outline/outline-generation-control';
import { OutlineIdeaCard } from '@/features/workspace/ui/outline/outline-idea-card';
import { OutlinePlanCard } from '@/features/workspace/ui/outline/outline-plan-card';
import { OutlineResultSection } from '@/features/workspace/ui/outline/outline-result-section';
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
  const { editor, generation } = useOutlineWorkflow({
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
  const { actions, result, status } = generation;

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
        disabled={status.isGenerating}
        idea={idea}
        onEdit={onEditIdea}
      />

      <OutlinePlanCard
        chapterCount={chapterCount}
        chapterRange={chapterRange}
        disabled={status.isGenerating}
        onChangeChapterCount={onChangeChapterCount}
        onChangeChapterRange={onChangeChapterRange}
        onChangeWordsPerChapter={onChangeWordsPerChapter}
        wordsPerChapter={wordsPerChapter}
      />

      <OutlineGenerationControl
        canGenerate={status.canGenerate}
        generationLabel={status.generationLabel}
        hasChapters={result.chapters.length > 0}
        isGenerating={status.isGenerating}
        isGeneratingOutline={status.isGeneratingOutline}
        onGenerate={() => {
          void actions.generateOutlineDraft();
        }}
        rangeLabel={result.rangeLabel}
      />

      {result.chapters.length > 0 ? (
        <OutlineResultSection
          canUndoOutline={canUndoOutline}
          chapters={result.chapters}
          disabled={status.isGenerating}
          displayRangeLabel={result.displayRangeLabel}
          expectedChapterCount={result.expectedChapterCount}
          generatingSectionsChapter={status.generatingSectionsChapter}
          hasPreview={result.hasPreview}
          missingChapterNumbers={result.missingChapterNumbers}
          onApplyOutlineDraft={actions.applyOutlineDraft}
          onDiscardPreview={actions.discardPreview}
          onEditChapter={editor.actions.openChapter}
          onEditSection={editor.actions.openSection}
          onGenerateSections={(chapterNumber, sectionCount) => {
            void actions.generateChapterSections(
              chapterNumber,
              sectionCount,
            );
          }}
          onUndoOutline={onUndoOutline}
          previewChapterCount={result.previewChapterCount}
          previewExpectedCount={result.previewExpectedCount}
        />
      ) : !status.isGenerating ? (
        <View style={styles.emptyState}>
          <ThemedText type="small" themeColor="textSecondary">
            当前范围还没有生成大纲
          </ThemedText>
        </View>
      ) : null}

      <Button
        align="between"
        disabled={appliedOutline.length === 0 || status.isGenerating}
        label="进入章节内容"
        onPress={onOpenChapter}
        trailingIcon={
          <SymbolView
            name={{ ios: 'arrow.right', android: 'arrow_forward' }}
            size={16}
            tintColor={
              appliedOutline.length > 0 && !status.isGenerating
                ? theme.background
                : theme.textSecondary
            }
          />
        }
      />

      <OutlineEditorModal
        onClose={editor.actions.close}
        onSave={editor.actions.save}
        target={editor.target}
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});
