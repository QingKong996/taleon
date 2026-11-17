import { useState } from 'react';

import {
  DEFAULT_CHAPTER_COUNT,
  DEFAULT_WORDS_PER_CHAPTER,
  MAX_CHAPTER_COUNT,
  MAX_WORDS_PER_CHAPTER,
  MIN_CHAPTER_COUNT,
  MIN_WORDS_PER_CHAPTER,
  OUTLINE_CHAPTERS,
  type WorkbenchStep,
} from '@/features/workspace/workbench-data';

function clamp(value: number, lower: number, upper: number) {
  return Math.min(Math.max(value, lower), upper);
}

export function useWorkbench() {
  const [step, setStep] = useState<WorkbenchStep>(0);
  const [unlockedStep, setUnlockedStep] = useState<WorkbenchStep>(0);
  const [idea, setIdea] = useState('');
  const [chapterCount, setChapterCount] = useState(DEFAULT_CHAPTER_COUNT);
  const [chapterRange, setChapterRange] = useState<[number, number]>([
    1,
    DEFAULT_CHAPTER_COUNT,
  ]);
  const [wordsPerChapter, setWordsPerChapter] = useState(
    DEFAULT_WORDS_PER_CHAPTER,
  );
  const [selectedChapter, setSelectedChapter] = useState(0);

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
    setChapterRange([1, chapterCount]);
    setUnlockedStep(1);
    setStep(1);
  }

  function changeChapterCount(value: number) {
    const nextCount = clamp(
      Math.round(value),
      MIN_CHAPTER_COUNT,
      MAX_CHAPTER_COUNT,
    );

    setChapterCount(nextCount);
    setChapterRange(([start, end]) => {
      if (start === 1 && end === chapterCount) {
        return [1, nextCount];
      }

      const nextEnd = Math.min(end, nextCount);

      return [Math.min(start, nextEnd), nextEnd];
    });
    setSelectedChapter((current) => Math.min(current, nextCount - 1));
  }

  function changeChapterRange(range: [number, number]) {
    const start = clamp(
      Math.round(range[0]),
      MIN_CHAPTER_COUNT,
      chapterCount,
    );
    const end = clamp(
      Math.round(range[1]),
      start,
      chapterCount,
    );

    setChapterRange([start, end]);
  }

  function changeWordsPerChapter(value: number) {
    setWordsPerChapter(
      clamp(
        Math.round(value),
        MIN_WORDS_PER_CHAPTER,
        MAX_WORDS_PER_CHAPTER,
      ),
    );
  }

  function generateChapters() {
    const rangeStartIndex = Math.min(
      chapterRange[0] - 1,
      OUTLINE_CHAPTERS.length - 1,
    );

    setSelectedChapter(Math.max(0, rangeStartIndex));
    setUnlockedStep(2);
    setStep(2);
  }

  function openStep(nextStep: WorkbenchStep) {
    if (nextStep <= unlockedStep) {
      setStep(nextStep);
    }
  }

  return {
    chapterCount,
    chapterRange,
    changeIdea,
    changeChapterCount,
    changeChapterRange,
    changeWordsPerChapter,
    generateChapters,
    generateOutline,
    idea,
    openStep,
    selectedChapter,
    setSelectedChapter,
    setStep,
    step,
    unlockedStep,
    wordsPerChapter,
  };
}
