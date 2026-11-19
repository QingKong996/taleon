import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { TabScrollView } from '@/components/tab-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { ScreenState } from '@/components/ui/screen-state';
import {
  createStory,
  readLatestStoryDocument,
  readStoryDocument,
  type StoryDocument,
} from '@/features/stories/model/story-storage';
import { useStoryAutosave } from '@/features/stories/model/use-story-autosave';
import { useWorkbench } from '@/features/workspace/model/use-workbench';
import { ChapterStep } from '@/features/workspace/ui/chapter/chapter-step';
import { IdeaStep } from '@/features/workspace/ui/idea/idea-step';
import { OutlineStep } from '@/features/workspace/ui/outline/outline-step';
import { StepProgress } from '@/features/workspace/ui/step-progress';

export function WorkspaceScreen() {
  const params = useLocalSearchParams<{
    storyId?: string | string[];
  }>();
  const routeStoryId = Array.isArray(params.storyId)
    ? params.storyId[0]
    : params.storyId;
  const [story, setStory] = useState<StoryDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setLoadError(null);

    const loadStory = routeStoryId
      ? readStoryDocument(routeStoryId)
      : readLatestStoryDocument();

    loadStory
      .then((nextStory) => {
        if (!isActive) {
          return;
        }

        setStory(nextStory);
        setLoadError(
          routeStoryId && !nextStory
            ? '这个故事不存在或无法读取'
            : null,
        );
      })
      .catch(() => {
        if (isActive) {
          setStory(null);
          setLoadError('无法读取这个故事，请稍后重试');
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [routeStoryId]);

  async function handleCreateStory() {
    if (isCreating) {
      return;
    }

    setIsCreating(true);

    try {
      const nextStory = await createStory();
      setStory(nextStory);
      setLoadError(null);
    } catch {
      Alert.alert('无法创建故事', '请稍后重试');
    } finally {
      setIsCreating(false);
    }
  }

  if (isLoading) {
    return <WorkspaceState loading title="正在打开故事" />;
  }

  if (!story) {
    return (
      <WorkspaceState
        action={
          <Button
            label={loadError ? '返回故事列表' : '创建故事'}
            loading={isCreating}
            onPress={() => {
              if (loadError) {
                router.navigate('/');
                return;
              }

              void handleCreateStory();
            }}
          />
        }
        description={
          loadError
            ? '请返回故事列表重新选择。'
            : '从故事页创建故事后，可以在这里继续创作。'
        }
        title={loadError ?? '还没有故事'}
      />
    );
  }

  return <WorkbenchEditor key={story.id} story={story} />;
}

function WorkbenchEditor({ story }: { story: StoryDocument }) {
  const workbench = useWorkbench(story);

  useStoryAutosave(story, workbench.snapshot);

  return (
    <TabScrollView key={workbench.step}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <ThemedText type="title">工作台</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {workbench.idea.trim() ? '更改会自动保存' : '新的故事'}
          </ThemedText>
        </View>
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
          onOpenChapter={() => workbench.openStep(2)}
          onUndoOutline={workbench.undoOutline}
          onUpdateChapterOutline={workbench.updateChapterOutline}
          onUpdateSectionOutline={workbench.updateSectionOutline}
          wordsPerChapter={workbench.wordsPerChapter}
        />
      ) : null}

      {workbench.step === 2 ? (
        <ChapterStep
          chapterNumber={workbench.selectedChapter}
          chapters={workbench.outline}
          idea={workbench.idea}
          onApplySectionContent={workbench.applySectionContent}
          onBackToOutline={() => workbench.setStep(1)}
          onSelectChapter={workbench.setSelectedChapter}
          wordsPerChapter={workbench.wordsPerChapter}
        />
      ) : null}
    </TabScrollView>
  );
}

function WorkspaceState({
  action,
  description,
  loading = false,
  title,
}: {
  action?: ReactNode;
  description?: string;
  loading?: boolean;
  title: string;
}) {
  return (
    <TabScrollView contentContainerStyle={styles.stateContent}>
      <ScreenState
        action={action}
        description={description}
        loading={loading}
        title={title}
      />
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
  stateContent: {
    flexGrow: 1,
  },
});
