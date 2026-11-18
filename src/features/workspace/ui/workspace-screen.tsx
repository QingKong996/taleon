import { StyleSheet, View } from 'react-native';

import { TabScrollView } from '@/components/tab-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ChapterStep } from '@/features/workspace/ui/chapter/chapter-step';
import { IdeaStep } from '@/features/workspace/ui/idea/idea-step';
import { OutlineStep } from '@/features/workspace/ui/outline/outline-step';
import { StepProgress } from '@/features/workspace/ui/step-progress';
import { useWorkbench } from '@/features/workspace/model/use-workbench';

export function WorkspaceScreen() {
  const workbench = useWorkbench();

  return (
    <TabScrollView key={workbench.step}>
      <View style={styles.header}>
        <ThemedText type="title">工作台</ThemedText>
        <StepProgress
          currentStep={workbench.step}
          onStepPress={workbench.openStep}
          unlockedStep={workbench.unlockedStep}
        />
      </View>

      {workbench.step === 0 ? (
        <IdeaStep
          idea={workbench.idea}
          onChangeIdea={workbench.changeIdea}
          onGenerate={workbench.openOutlineStep}
        />
      ) : null}

      {workbench.step === 1 ? (
        <OutlineStep
          appliedOutline={workbench.outline}
          canUndoOutline={workbench.canUndoOutline}
          chapterCount={workbench.chapterCount}
          chapterRange={workbench.chapterRange}
          idea={workbench.idea}
          onApplyChapterSections={workbench.applyChapterSections}
          onApplyOutline={workbench.applyOutline}
          onChangeChapterCount={workbench.changeChapterCount}
          onChangeChapterRange={workbench.changeChapterRange}
          onChangeWordsPerChapter={workbench.changeWordsPerChapter}
          onEditIdea={() => workbench.setStep(0)}
          onUndoOutline={workbench.undoOutline}
          onUpdateChapterOutline={workbench.updateChapterOutline}
          onUpdateSectionOutline={workbench.updateSectionOutline}
          wordsPerChapter={workbench.wordsPerChapter}
        />
      ) : null}

      {workbench.step === 2 ? (
        <ChapterStep
          chapterIndex={workbench.selectedChapter}
          onBackToOutline={() => workbench.setStep(1)}
          onSelectChapter={workbench.setSelectedChapter}
        />
      ) : null}
    </TabScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 16,
  },
});
