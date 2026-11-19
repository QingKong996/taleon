import {
  STORY_STORAGE_VERSION,
  UNTITLED_STORY_TITLE,
  type StoryDocument,
  type StorySummary,
} from '@/features/stories/model/story-types';
import { normalizeStoryTitle } from '@/features/stories/model/story-title';
import {
  DEFAULT_CHAPTER_COUNT,
  DEFAULT_WORDS_PER_CHAPTER,
  MAX_CHAPTER_COUNT,
  MAX_WORDS_PER_CHAPTER,
  MIN_CHAPTER_COUNT,
  MIN_WORDS_PER_CHAPTER,
  type StoryOutlineChapter,
  type StoryOutlineSection,
  type WorkbenchStep,
} from '@/features/workspace/model/workbench-data';

function clamp(value: number, lower: number, upper: number) {
  return Math.min(Math.max(value, lower), upper);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isWorkbenchStep(value: unknown): value is WorkbenchStep {
  return value === 0 || value === 1 || value === 2;
}

function normalizeStep(value: unknown): WorkbenchStep {
  return isWorkbenchStep(value) ? value : 0;
}

function normalizeUnitNumber(
  value: unknown,
  fallback: number,
  lower: number,
  upper: number,
) {
  return typeof value === 'number' && Number.isFinite(value)
    ? clamp(Math.round(value), lower, upper)
    : fallback;
}

function normalizeEntry(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  const title = typeof value.title === 'string' ? value.title.trim() : '';
  const outline =
    typeof value.outline === 'string' ? value.outline.trim() : '';

  if (!title || !outline) {
    return null;
  }

  return { outline, title };
}

function normalizeSection(value: unknown): StoryOutlineSection | null {
  const entry = normalizeEntry(value);

  if (!entry || !isRecord(value)) {
    return null;
  }

  return {
    ...entry,
    ...(typeof value.content === 'string'
      ? { content: value.content.trim() }
      : {}),
  };
}

function normalizeOutline(
  value: unknown,
  chapterCount: number,
): StoryOutlineChapter[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const chapters: StoryOutlineChapter[] = [];
  const chapterNumbers = new Set<number>();

  for (const item of value) {
    const entry = normalizeEntry(item);

    if (
      !entry ||
      !isRecord(item) ||
      typeof item.chapterNumber !== 'number' ||
      !Number.isInteger(item.chapterNumber) ||
      item.chapterNumber < 1 ||
      item.chapterNumber > chapterCount ||
      chapterNumbers.has(item.chapterNumber)
    ) {
      continue;
    }

    const sections = Array.isArray(item.sections)
      ? item.sections
          .map(normalizeSection)
          .filter(
            (section): section is StoryOutlineSection =>
              section !== null,
          )
      : [];

    chapterNumbers.add(item.chapterNumber);
    chapters.push({
      ...entry,
      chapterNumber: item.chapterNumber,
      sections,
    });
  }

  return chapters.sort(
    (left, right) => left.chapterNumber - right.chapterNumber,
  );
}

export function normalizeStorySummary(
  value: unknown,
): StorySummary | null {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    !value.id ||
    typeof value.title !== 'string' ||
    typeof value.createdAt !== 'number' ||
    typeof value.updatedAt !== 'number'
  ) {
    return null;
  }

  return {
    createdAt: value.createdAt,
    id: value.id,
    outlineChapterCount:
      typeof value.outlineChapterCount === 'number'
        ? Math.max(0, Math.round(value.outlineChapterCount))
        : 0,
    selectedChapter: normalizeUnitNumber(value.selectedChapter, 1, 1, 100),
    step: normalizeStep(value.step),
    title: value.title.trim() || UNTITLED_STORY_TITLE,
    updatedAt: value.updatedAt,
  };
}

export function normalizeStoryDocument(
  value: unknown,
): StoryDocument | null {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    !value.id ||
    value.version !== STORY_STORAGE_VERSION
  ) {
    return null;
  }

  const createdAt =
    typeof value.createdAt === 'number' &&
    Number.isFinite(value.createdAt)
      ? value.createdAt
      : Date.now();
  const updatedAt =
    typeof value.updatedAt === 'number' &&
    Number.isFinite(value.updatedAt)
      ? value.updatedAt
      : createdAt;
  const chapterCount = normalizeUnitNumber(
    value.chapterCount,
    DEFAULT_CHAPTER_COUNT,
    MIN_CHAPTER_COUNT,
    MAX_CHAPTER_COUNT,
  );
  const storedRange = Array.isArray(value.chapterRange)
    ? value.chapterRange
    : [];
  const rangeStart = normalizeUnitNumber(
    storedRange[0],
    1,
    MIN_CHAPTER_COUNT,
    chapterCount,
  );
  const rangeEnd = normalizeUnitNumber(
    storedRange[1],
    chapterCount,
    rangeStart,
    chapterCount,
  );
  const unlockedStep = normalizeStep(value.unlockedStep);
  const step = Math.min(
    normalizeStep(value.step),
    unlockedStep,
  ) as WorkbenchStep;
  const idea = typeof value.idea === 'string' ? value.idea : '';
  const title =
    typeof value.title === 'string'
      ? normalizeStoryTitle(value.title)
      : '';

  return {
    chapterCount,
    chapterRange: [rangeStart, rangeEnd],
    createdAt,
    id: value.id,
    idea,
    outline: normalizeOutline(value.outline, chapterCount),
    selectedChapter: normalizeUnitNumber(
      value.selectedChapter,
      1,
      1,
      chapterCount,
    ),
    step,
    ...(title ? { title } : {}),
    unlockedStep,
    updatedAt,
    version: STORY_STORAGE_VERSION,
    wordsPerChapter: normalizeUnitNumber(
      value.wordsPerChapter,
      DEFAULT_WORDS_PER_CHAPTER,
      MIN_WORDS_PER_CHAPTER,
      MAX_WORDS_PER_CHAPTER,
    ),
  };
}
