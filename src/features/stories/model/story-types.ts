import type {
  WorkbenchSnapshot,
  WorkbenchStep,
} from '@/features/workspace/model/workbench-data';

export const STORY_STORAGE_VERSION = 1;
export const UNTITLED_STORY_TITLE = '未命名故事';
export const MAX_STORY_TITLE_LENGTH = 40;

export type StorySummary = {
  createdAt: number;
  id: string;
  outlineChapterCount: number;
  selectedChapter: number;
  step: WorkbenchStep;
  title: string;
  updatedAt: number;
};

export type StoryDocument = WorkbenchSnapshot & {
  createdAt: number;
  id: string;
  title?: string;
  updatedAt: number;
  version: typeof STORY_STORAGE_VERSION;
};
