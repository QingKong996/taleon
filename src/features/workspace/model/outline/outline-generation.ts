import type { OutlineGenerationResult } from '@/features/workspace/model/outline/outline-parser';
import type { StoryOutlineChapter } from '@/features/workspace/model/workbench-data';

export const MAX_CHAPTERS_PER_REQUEST = 12;

export type OutlineProgress = {
  completed: number;
  total: number;
};

export type ActiveGeneration =
  | { kind: 'outline' }
  | { chapterNumber: number; kind: 'sections' };

export function createOutlineResult(
  chapters: readonly StoryOutlineChapter[],
  rangeStart: number,
  total: number,
): OutlineGenerationResult {
  const expectedChapterNumbers = Array.from(
    { length: total },
    (_, index) => rangeStart + index,
  );
  const generatedNumbers = new Set(
    chapters.map((chapter) => chapter.chapterNumber),
  );

  return {
    chapters: [...chapters],
    expectedChapterNumbers,
    missingChapterNumbers: expectedChapterNumbers.filter(
      (chapterNumber) => !generatedNumbers.has(chapterNumber),
    ),
  };
}
