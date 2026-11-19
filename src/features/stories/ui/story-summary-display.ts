import {
  UNTITLED_STORY_TITLE,
  type StorySummary,
} from '@/features/stories/model/story-types';

const COVER_COLORS = [
  '#9B5D4B',
  '#456D8A',
  '#665386',
  '#50745D',
  '#8A6840',
] as const;

export function getStoryCoverColor(storyId: string) {
  const hash = [...storyId].reduce(
    (value, character) => value + character.charCodeAt(0),
    0,
  );

  return COVER_COLORS[hash % COVER_COLORS.length];
}

export function getStoryCoverMark(story: StorySummary) {
  return story.title === UNTITLED_STORY_TITLE
    ? '新'
    : story.title.charAt(0);
}

export function getStoryMeta(story: StorySummary) {
  if (story.step === 2) {
    return `未完成 · 第 ${story.selectedChapter} 章`;
  }

  if (story.step === 1) {
    return `未完成 · ${story.outlineChapterCount} 章大纲`;
  }

  return '未完成 · 故事想法';
}
