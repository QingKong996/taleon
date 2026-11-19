import { StyleSheet, View } from 'react-native';

import { TabScrollView } from '@/components/tab-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { useStoryAutosave } from '@/features/stories/model/use-story-autosave';
import type { StoryDocument } from '@/features/stories/model/story-types';
import { useWorkbench } from '@/features/workspace/model/use-workbench';
import { ChapterStep } from '@/features/workspace/ui/chapter/chapter-step';
import { IdeaStep } from '@/features/workspace/ui/idea/idea-step';
import { OutlineStep } from '@/features/workspace/ui/outline/outline-step';
import { StepProgress } from '@/features/workspace/ui/step-progress';

type WorkbenchEditorProps = {
  story: StoryDocument;
};

export function WorkbenchEditor({ story }: WorkbenchEditorProps) {
  const workbench = useWorkbench(story);

  useStoryAutosave(story, workbench.snapshot);

  return (
    <TabScrollView key={workbench.navigation.step}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <ThemedText type="title">工作台</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {workbench.plan.idea.trim() ? '更改会自动保存' : '新的故事'}
          </ThemedText>
        </View>
        <StepProgress
          currentStep={workbench.navigation.step}
          onStepPress={workbench.navigation.goToStep}
          unlockedStep={workbench.navigation.unlockedStep}
        />
      </View>

      {workbench.navigation.step === 0 ? (
        <IdeaStep
          idea={workbench.plan.idea}
          onChangeIdea={workbench.plan.changeIdea}
          onGenerate={workbench.navigation.openOutlineStep}
        />
      ) : null}

      {workbench.navigation.step === 1 ? (
        <OutlineStep
          appliedOutline={workbench.outline.chapters}
          canUndoOutline={workbench.outline.canUndo}
          chapterCount={workbench.plan.chapterCount}
          chapterRange={workbench.plan.chapterRange}
          idea={workbench.plan.idea}
          onApplyChapterSections={workbench.outline.applyChapterSections}
          onApplyOutline={workbench.outline.applyOutline}
          onChangeChapterCount={workbench.plan.changeChapterCount}
          onChangeChapterRange={workbench.plan.changeChapterRange}
          onChangeWordsPerChapter={
            workbench.plan.changeWordsPerChapter
          }
          onEditIdea={() => workbench.navigation.goToStep(0)}
          onOpenChapter={() => workbench.navigation.goToStep(2)}
          onUndoOutline={workbench.outline.undo}
          onUpdateChapterOutline={workbench.outline.updateChapter}
          onUpdateSectionOutline={workbench.outline.updateSection}
          wordsPerChapter={workbench.plan.wordsPerChapter}
        />
      ) : null}

      {workbench.navigation.step === 2 ? (
        <ChapterStep
          chapterNumber={workbench.chapter.selectedChapter}
          chapters={workbench.outline.chapters}
          idea={workbench.plan.idea}
          onApplySectionContent={workbench.chapter.applySectionContent}
          onBackToOutline={() => workbench.navigation.goToStep(1)}
          onSelectChapter={workbench.chapter.selectChapter}
          wordsPerChapter={workbench.plan.wordsPerChapter}
        />
      ) : null}
    </TabScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 16,
  },
  heading: {
    gap: 4,
  },
});
