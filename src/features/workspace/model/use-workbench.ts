import { useMemo } from 'react';

import {
  MIN_CHAPTER_COUNT,
  type StoryOutlineChapter,
  type WorkbenchSnapshot,
} from '@/features/workspace/model/workbench-data';
import { useWorkbenchNavigation } from '@/features/workspace/model/workbench/use-workbench-navigation';
import { useWorkbenchOutline } from '@/features/workspace/model/workbench/use-workbench-outline';
import { useWorkbenchPlan } from '@/features/workspace/model/workbench/use-workbench-plan';
import {
  clamp,
  createWorkbenchSnapshot,
  mergeOutline,
} from '@/features/workspace/model/workbench/workbench-state';

export function useWorkbench(initialSnapshot?: WorkbenchSnapshot) {
  const plan = useWorkbenchPlan(initialSnapshot);
  const navigation = useWorkbenchNavigation(initialSnapshot);
  const outline = useWorkbenchOutline(initialSnapshot, {
    chapterRange: plan.chapterRange,
    selectedChapter: navigation.selectedChapter,
  });

  function changeIdea(value: string) {
    const hasOutline = outline.chapters.length > 0;

    plan.changeIdea(value);

    if (hasOutline) {
      outline.resetOutline();
      plan.resetChapterRange();
    }

    navigation.resetForIdeaChange(hasOutline);
  }

  function openOutlineStep() {
    if (!plan.idea.trim()) {
      return;
    }

    navigation.setSelectedChapter(1);
    plan.resetChapterRange();
    navigation.advanceToStep(1);
  }

  function changeChapterCount(value: number) {
    const nextCount = plan.changeChapterCount(value);

    outline.dropChaptersAbove(nextCount);
    navigation.setSelectedChapter((current) =>
      Math.min(current, nextCount),
    );
  }

  function applyOutline(
    generated: readonly StoryOutlineChapter[],
    generatedRange?: readonly [number, number],
  ) {
    const applicable = generated.filter(
      (chapter) => chapter.chapterNumber <= plan.chapterCount,
    );

    if (applicable.length === 0) {
      return false;
    }

    outline.commitOutline(mergeOutline(outline.chapters, applicable));
    navigation.unlockStep(2);
    const nextRangeStart = generatedRange
      ? clamp(
          generatedRange[0],
          MIN_CHAPTER_COUNT,
          plan.chapterCount,
        )
      : applicable[0].chapterNumber;
    const nextRangeEnd = generatedRange
      ? clamp(generatedRange[1], nextRangeStart, plan.chapterCount)
      : applicable[applicable.length - 1].chapterNumber;

    plan.applyChapterRange([nextRangeStart, nextRangeEnd]);
    navigation.setSelectedChapter((current) =>
      applicable.some((chapter) => chapter.chapterNumber === current)
        ? current
        : applicable[0].chapterNumber,
    );

    return true;
  }

  function undoOutline() {
    const previous = outline.undoOutline();

    if (!previous) {
      return;
    }

    plan.applyChapterRange(previous.range);
    navigation.setSelectedChapter(previous.selectedChapter);
    navigation.restoreUnlockedStep(
      previous.chapters.length > 0 ? 2 : 1,
    );
  }

  const snapshot = useMemo<WorkbenchSnapshot>(
    () =>
      createWorkbenchSnapshot({
        chapterCount: plan.chapterCount,
        chapterRange: plan.chapterRange,
        idea: plan.idea,
        outline: outline.chapters,
        selectedChapter: navigation.selectedChapter,
        step: navigation.step,
        unlockedStep: navigation.unlockedStep,
        wordsPerChapter: plan.wordsPerChapter,
      }),
    [
      navigation.selectedChapter,
      navigation.step,
      navigation.unlockedStep,
      outline.chapters,
      plan.chapterCount,
      plan.chapterRange,
      plan.idea,
      plan.wordsPerChapter,
    ],
  );

  return {
    chapter: {
      applySectionContent: outline.applySectionContent,
      selectedChapter: navigation.selectedChapter,
      selectChapter: navigation.setSelectedChapter,
    },
    navigation: {
      goToStep: navigation.goToStep,
      openOutlineStep,
      step: navigation.step,
      unlockedStep: navigation.unlockedStep,
    },
    outline: {
      applyChapterSections: outline.applyChapterSections,
      applyOutline,
      canUndo: outline.canUndoOutline,
      chapters: outline.chapters,
      undo: undoOutline,
      updateChapter: outline.updateChapterOutline,
      updateSection: outline.updateSectionOutline,
    },
    plan: {
      chapterCount: plan.chapterCount,
      chapterRange: plan.chapterRange,
      changeChapterCount,
      changeChapterRange: plan.changeChapterRange,
      changeIdea,
      changeWordsPerChapter: plan.changeWordsPerChapter,
      idea: plan.idea,
      wordsPerChapter: plan.wordsPerChapter,
    },
    snapshot,
  };
}
