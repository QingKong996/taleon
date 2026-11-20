import { z } from 'zod';

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

const unknownArraySchema = z.array(z.unknown());
const finiteNumberSchema = z.number().refine(Number.isFinite);

const storyEntrySchema = z.object({
  outline: z.string(),
  title: z.string(),
});

const sectionContentSchema = z.object({
  content: z.unknown().optional(),
});

const chapterInputSchema = z.object({
  chapterNumber: z.number().int(),
  outline: z.string(),
  sections: z.unknown().optional(),
  title: z.string(),
});

const storySummarySchema = z
  .object({
    createdAt: finiteNumberSchema,
    id: z.string().min(1),
    outlineChapterCount: z.unknown().optional(),
    selectedChapter: z.unknown().optional(),
    step: z.unknown().optional(),
    title: z.string(),
    updatedAt: finiteNumberSchema,
  })
  .transform((story) => ({
    createdAt: story.createdAt,
    id: story.id,
    outlineChapterCount:
      typeof story.outlineChapterCount === 'number'
        ? Math.max(0, Math.round(story.outlineChapterCount))
        : 0,
    selectedChapter: normalizeUnitNumber(
      story.selectedChapter,
      1,
      1,
      100,
    ),
    step: normalizeStep(story.step),
    title: story.title.trim() || UNTITLED_STORY_TITLE,
    updatedAt: story.updatedAt,
  } satisfies StorySummary));

const storyDocumentInputSchema = z.object({
  chapterCount: z.unknown().optional(),
  chapterRange: z.unknown().optional(),
  createdAt: z.unknown().optional(),
  id: z.string().min(1),
  idea: z.unknown().optional(),
  outline: z.unknown().optional(),
  selectedChapter: z.unknown().optional(),
  step: z.unknown().optional(),
  title: z.unknown().optional(),
  unlockedStep: z.unknown().optional(),
  updatedAt: z.unknown().optional(),
  version: z.literal(STORY_STORAGE_VERSION),
  wordsPerChapter: z.unknown().optional(),
});

function clamp(value: number, lower: number, upper: number) {
  return Math.min(Math.max(value, lower), upper);
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

function readTimestamp(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : fallback;
}

function normalizeEntry(value: unknown) {
  const parsed = storyEntrySchema.safeParse(value);

  if (!parsed.success) {
    return null;
  }

  const title = parsed.data.title.trim();
  const outline = parsed.data.outline.trim();

  return title && outline ? { outline, title } : null;
}

function normalizeSection(value: unknown): StoryOutlineSection | null {
  const entry = normalizeEntry(value);

  if (!entry) {
    return null;
  }

  const parsedContent = sectionContentSchema.safeParse(value);
  const content = parsedContent.success
    ? parsedContent.data.content
    : undefined;

  return {
    ...entry,
    ...(typeof content === 'string'
      ? { content: content.trim() }
      : {}),
  };
}

function normalizeChapter(
  value: unknown,
  chapterCount: number,
): StoryOutlineChapter | null {
  const parsed = chapterInputSchema.safeParse(value);

  if (
    !parsed.success ||
    parsed.data.chapterNumber < 1 ||
    parsed.data.chapterNumber > chapterCount
  ) {
    return null;
  }

  const title = parsed.data.title.trim();
  const outline = parsed.data.outline.trim();

  if (!title || !outline) {
    return null;
  }

  const parsedSections = unknownArraySchema.safeParse(
    parsed.data.sections,
  );
  const sections = parsedSections.success
    ? parsedSections.data
        .map(normalizeSection)
        .filter(
          (section): section is StoryOutlineSection =>
            section !== null,
        )
    : [];

  return {
    chapterNumber: parsed.data.chapterNumber,
    outline,
    sections,
    title,
  };
}

function normalizeOutline(
  value: unknown,
  chapterCount: number,
): StoryOutlineChapter[] {
  const parsed = unknownArraySchema.safeParse(value);

  if (!parsed.success) {
    return [];
  }

  const chapters: StoryOutlineChapter[] = [];
  const chapterNumbers = new Set<number>();

  for (const item of parsed.data) {
    const chapter = normalizeChapter(item, chapterCount);

    if (!chapter || chapterNumbers.has(chapter.chapterNumber)) {
      continue;
    }

    chapters.push(chapter);
    chapterNumbers.add(chapter.chapterNumber);
  }

  return chapters.sort(
    (left, right) => left.chapterNumber - right.chapterNumber,
  );
}

export function normalizeStorySummary(
  value: unknown,
): StorySummary | null {
  const parsed = storySummarySchema.safeParse(value);

  return parsed.success ? parsed.data : null;
}

export function normalizeStoryDocument(
  value: unknown,
): StoryDocument | null {
  const parsed = storyDocumentInputSchema.safeParse(value);

  if (!parsed.success) {
    return null;
  }

  const story = parsed.data;
  const createdAt = readTimestamp(story.createdAt, Date.now());
  const updatedAt = readTimestamp(story.updatedAt, createdAt);
  const chapterCount = normalizeUnitNumber(
    story.chapterCount,
    DEFAULT_CHAPTER_COUNT,
    MIN_CHAPTER_COUNT,
    MAX_CHAPTER_COUNT,
  );
  const storedRange = unknownArraySchema.safeParse(story.chapterRange);
  const range = storedRange.success ? storedRange.data : [];
  const rangeStart = normalizeUnitNumber(
    range[0],
    1,
    MIN_CHAPTER_COUNT,
    chapterCount,
  );
  const rangeEnd = normalizeUnitNumber(
    range[1],
    chapterCount,
    rangeStart,
    chapterCount,
  );
  const unlockedStep = normalizeStep(story.unlockedStep);
  const step = Math.min(
    normalizeStep(story.step),
    unlockedStep,
  ) as WorkbenchStep;
  const title =
    typeof story.title === 'string'
      ? normalizeStoryTitle(story.title)
      : '';

  return {
    chapterCount,
    chapterRange: [rangeStart, rangeEnd],
    createdAt,
    id: story.id,
    idea: typeof story.idea === 'string' ? story.idea : '',
    outline: normalizeOutline(story.outline, chapterCount),
    selectedChapter: normalizeUnitNumber(
      story.selectedChapter,
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
      story.wordsPerChapter,
      DEFAULT_WORDS_PER_CHAPTER,
      MIN_WORDS_PER_CHAPTER,
      MAX_WORDS_PER_CHAPTER,
    ),
  };
}
