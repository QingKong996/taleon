import { useState } from 'react';

import {
  DEFAULT_CHAPTER_COUNT,
  DEFAULT_WORDS_PER_CHAPTER,
  MAX_WORDS_PER_CHAPTER,
  MIN_WORDS_PER_CHAPTER,
  type WorkbenchSnapshot,
} from '@/features/workspace/model/workbench-data';
import {
  clamp,
  clampChapterCount,
  clampChapterRange,
} from '@/features/workspace/model/workbench/workbench-state';

export function useWorkbenchPlan(initialSnapshot?: WorkbenchSnapshot) {
  const [idea, setIdea] = useState(initialSnapshot?.idea ?? '');
  const [chapterCount, setChapterCount] = useState(
    initialSnapshot?.chapterCount ?? DEFAULT_CHAPTER_COUNT,
  );
  const [chapterRange, setChapterRange] = useState<[number, number]>(
    initialSnapshot?.chapterRange ?? [1, DEFAULT_CHAPTER_COUNT],
  );
  const [wordsPerChapter, setWordsPerChapter] = useState(
    initialSnapshot?.wordsPerChapter ?? DEFAULT_WORDS_PER_CHAPTER,
  );

  function changeIdea(value: string) {
    setIdea(value);
  }

  function changeChapterCount(value: number) {
    const nextCount = clampChapterCount(value);

    setChapterCount(nextCount);
    setChapterRange((currentRange) =>
      clampChapterRange(currentRange, nextCount),
    );

    return nextCount;
  }

  function changeChapterRange(range: [number, number]) {
    setChapterRange(clampChapterRange(range, chapterCount));
  }

  function applyChapterRange(range: readonly [number, number]) {
    setChapterRange(clampChapterRange(range, chapterCount));
  }

  function resetChapterRange() {
    setChapterRange([1, chapterCount]);
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

  return {
    applyChapterRange,
    chapterCount,
    chapterRange,
    changeChapterCount,
    changeChapterRange,
    changeIdea,
    changeWordsPerChapter,
    idea,
    resetChapterRange,
    wordsPerChapter,
  };
}
