export const WORKBENCH_STEPS = [
  { step: 0, label: '故事想法' },
  { step: 1, label: '故事大纲' },
  { step: 2, label: '章节内容' },
] as const;

export type WorkbenchStep = (typeof WORKBENCH_STEPS)[number]['step'];

export type StoryOutlineEntry = {
  outline: string;
  title: string;
};

export type StoryOutlineSection = StoryOutlineEntry & {
  content?: string;
};

export type StoryOutlineChapter = StoryOutlineEntry & {
  chapterNumber: number;
  sections: readonly StoryOutlineSection[];
};

export type WorkbenchSnapshot = {
  chapterCount: number;
  chapterRange: [number, number];
  idea: string;
  outline: readonly StoryOutlineChapter[];
  selectedChapter: number;
  step: WorkbenchStep;
  unlockedStep: WorkbenchStep;
  wordsPerChapter: number;
};

export const DEFAULT_CHAPTER_COUNT = 12;
export const DEFAULT_SECTION_COUNT = 3;
export const DEFAULT_WORDS_PER_CHAPTER = 2000;
export const MIN_CHAPTER_COUNT = 1;
export const MAX_CHAPTER_COUNT = 100;
export const MIN_SECTION_COUNT = 1;
export const MAX_SECTION_COUNT = 12;
export const MIN_WORDS_PER_CHAPTER = 500;
export const MAX_WORDS_PER_CHAPTER = 20000;
