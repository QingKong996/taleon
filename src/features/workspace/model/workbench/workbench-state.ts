import {
  MAX_CHAPTER_COUNT,
  MIN_CHAPTER_COUNT,
  type StoryOutlineChapter,
  type WorkbenchSnapshot,
} from '@/features/workspace/model/workbench-data';

export type OutlineUndoSnapshot = {
  chapters: readonly StoryOutlineChapter[];
  range: [number, number];
  selectedChapter: number;
};

export function clamp(value: number, lower: number, upper: number) {
  return Math.min(Math.max(value, lower), upper);
}

export function clampChapterCount(value: number) {
  return clamp(Math.round(value), MIN_CHAPTER_COUNT, MAX_CHAPTER_COUNT);
}

export function clampChapterRange(
  [start, end]: readonly [number, number],
  chapterCount: number,
): [number, number] {
  const nextStart = clamp(
    Math.round(start),
    MIN_CHAPTER_COUNT,
    chapterCount,
  );
  const nextEnd = clamp(Math.round(end), nextStart, chapterCount);

  return [nextStart, nextEnd];
}

export function mergeOutline(
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

export function createWorkbenchSnapshot({
  chapterCount,
  chapterRange,
  idea,
  outline,
  selectedChapter,
  step,
  unlockedStep,
  wordsPerChapter,
}: WorkbenchSnapshot): WorkbenchSnapshot {
  return {
    chapterCount,
    chapterRange,
    idea,
    outline,
    selectedChapter,
    step,
    unlockedStep,
    wordsPerChapter,
  };
}
