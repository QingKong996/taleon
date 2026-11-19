import type { StoryOutlineChapter } from '@/features/workspace/model/workbench-data';

export function formatChapterRange(
  [start, end]: readonly [number, number],
) {
  return start === end ? `第 ${start} 章` : `第 ${start}–${end} 章`;
}

export function formatOutlineRange(
  chapters: readonly StoryOutlineChapter[],
) {
  const start = chapters[0]?.chapterNumber;
  const end = chapters[chapters.length - 1]?.chapterNumber;

  return start && end ? formatChapterRange([start, end]) : '';
}

export function formatMissingChapters(chapters: readonly number[]) {
  const visible = chapters.slice(0, 6).join('、');

  return chapters.length > 6
    ? `${visible} 等 ${chapters.length} 章`
    : visible;
}
