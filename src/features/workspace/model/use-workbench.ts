import { useRef, useState } from 'react';

import {
  DEFAULT_CHAPTER_COUNT,
  DEFAULT_WORDS_PER_CHAPTER,
  MAX_CHAPTER_COUNT,
  MAX_WORDS_PER_CHAPTER,
  MIN_CHAPTER_COUNT,
  MIN_WORDS_PER_CHAPTER,
  type StoryOutlineChapter,
  type WorkbenchStep,
} from '@/features/workspace/model/workbench-data';

function clamp(value: number, lower: number, upper: number) {
  return Math.min(Math.max(value, lower), upper);
}

function mergeOutline(
  current: readonly StoryOutlineChapter[],
  generated: readonly StoryOutlineChapter[],
) {
  const generatedNumbers = new Set(
    generated.map((chapter) => chapter.chapterNumber),
  );

  return [
    ...current.filter(
      (chapter) => !generatedNumbers.has(chapter.chapterNumber),
    ),
    ...generated,
  ].sort((left, right) => left.chapterNumber - right.chapterNumber);
}

type OutlineSnapshot = {
  chapters: readonly StoryOutlineChapter[];
  range: [number, number];
  selectedChapter: number;
};

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
  const [outline, setOutline] = useState<readonly StoryOutlineChapter[]>([]);
  const [previousOutline, setPreviousOutline] =
    useState<OutlineSnapshot | null>(null);
  const outlineRef = useRef<readonly StoryOutlineChapter[]>([]);

  function replaceOutline(nextOutline: readonly StoryOutlineChapter[]) {
    outlineRef.current = nextOutline;
    setOutline(nextOutline);
  }

  function changeIdea(value: string) {
    setIdea(value);

    if (outlineRef.current.length > 0) {
      replaceOutline([]);
      setPreviousOutline(null);
      setSelectedChapter(0);
    }

    if (unlockedStep > 0) {
      setUnlockedStep(0);
    }
  }

  function openOutlineStep() {
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
    const nextOutline = outlineRef.current.filter(
      (chapter) => chapter.chapterNumber <= nextCount,
    );

    if (nextOutline.length !== outlineRef.current.length) {
      replaceOutline(nextOutline);
    }

    setPreviousOutline(null);
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

  function applyOutline(
    generated: readonly StoryOutlineChapter[],
    generatedRange?: readonly [number, number],
  ) {
    const applicable = generated.filter(
      (chapter) => chapter.chapterNumber <= chapterCount,
    );

    if (applicable.length === 0) {
      return false;
    }

    setPreviousOutline({
      chapters: outlineRef.current,
      range: chapterRange,
      selectedChapter,
    });
    replaceOutline(mergeOutline(outlineRef.current, applicable));
    const nextRangeStart = generatedRange
      ? clamp(generatedRange[0], MIN_CHAPTER_COUNT, chapterCount)
      : applicable[0].chapterNumber;
    const nextRangeEnd = generatedRange
      ? clamp(generatedRange[1], nextRangeStart, chapterCount)
      : applicable[applicable.length - 1].chapterNumber;

    setChapterRange([
      nextRangeStart,
      nextRangeEnd,
    ]);
    setSelectedChapter(
      clamp(applicable[0].chapterNumber - 1, 0, chapterCount - 1),
    );
    setUnlockedStep(2);

    return true;
  }

  function undoOutline() {
    if (!previousOutline) {
      return;
    }

    replaceOutline(previousOutline.chapters);
    setChapterRange(previousOutline.range);
    setSelectedChapter(previousOutline.selectedChapter);
    setPreviousOutline(null);
    setUnlockedStep(previousOutline.chapters.length > 0 ? 2 : 1);
  }

  function openStep(nextStep: WorkbenchStep) {
    if (nextStep <= unlockedStep) {
      setStep(nextStep);
    }
  }

  return {
    applyOutline,
    canUndoOutline: previousOutline !== null,
    chapterCount,
    chapterRange,
    changeIdea,
    changeChapterCount,
    changeChapterRange,
    changeWordsPerChapter,
    idea,
    openOutlineStep,
    openStep,
    outline,
    selectedChapter,
    setSelectedChapter,
    setStep,
    step,
    undoOutline,
    unlockedStep,
    wordsPerChapter,
  };
}
