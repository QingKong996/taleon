import { useState } from 'react';

import {
  OUTLINE_CHAPTERS,
  type WorkbenchStep,
} from '@/features/workspace/workbench-data';

export function useWorkbench() {
  const [step, setStep] = useState<WorkbenchStep>(0);
  const [unlockedStep, setUnlockedStep] = useState<WorkbenchStep>(0);
  const [idea, setIdea] = useState('');
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [chapterSummaries, setChapterSummaries] = useState<string[]>(() =>
    OUTLINE_CHAPTERS.map((chapter) => chapter.summary),
  );

  function changeIdea(value: string) {
    setIdea(value);

    if (unlockedStep > 0) {
      setUnlockedStep(0);
    }
  }

  function generateOutline() {
    if (!idea.trim()) {
      return;
    }

    setSelectedChapter(0);
    setChapterSummaries(OUTLINE_CHAPTERS.map((chapter) => chapter.summary));
    setUnlockedStep(1);
    setStep(1);
  }

  function generateChapter() {
    setUnlockedStep(2);
    setStep(2);
  }

  function openStep(nextStep: WorkbenchStep) {
    if (nextStep <= unlockedStep) {
      setStep(nextStep);
    }
  }

  function updateChapterSummary(index: number, summary: string) {
    setChapterSummaries((currentSummaries) =>
      currentSummaries.map((chapterSummary, chapterIndex) =>
        chapterIndex === index ? summary : chapterSummary,
      ),
    );
  }

  return {
    chapterSummaries,
    changeIdea,
    generateChapter,
    generateOutline,
    idea,
    openStep,
    selectedChapter,
    setSelectedChapter,
    setStep,
    step,
    unlockedStep,
    updateChapterSummary,
  };
}
