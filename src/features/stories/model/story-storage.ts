import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_CHAPTER_COUNT,
  DEFAULT_WORDS_PER_CHAPTER,
  MAX_CHAPTER_COUNT,
  MAX_WORDS_PER_CHAPTER,
  MIN_CHAPTER_COUNT,
  MIN_WORDS_PER_CHAPTER,
  type StoryOutlineChapter,
  type StoryOutlineSection,
  type WorkbenchSnapshot,
  type WorkbenchStep,
} from '@/features/workspace/model/workbench-data';

const STORY_INDEX_STORAGE_KEY = ['taleon', 'stories', 'v1'].join('.');
const STORY_DOCUMENT_STORAGE_PREFIX = 'taleon.story.v1.';
const STORY_STORAGE_VERSION = 1;

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

let storageQueue: Promise<void> = Promise.resolve();

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

export function normalizeStoryTitle(value: string) {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, MAX_STORY_TITLE_LENGTH);
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
  const outline = typeof value.outline === 'string' ? value.outline.trim() : '';

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
          .filter((section): section is StoryOutlineSection => section !== null)
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

function normalizeSummary(value: unknown): StorySummary | null {
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

function normalizeDocument(value: unknown): StoryDocument | null {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    !value.id ||
    value.version !== STORY_STORAGE_VERSION
  ) {
    return null;
  }

  const createdAt =
    typeof value.createdAt === 'number' && Number.isFinite(value.createdAt)
      ? value.createdAt
      : Date.now();
  const updatedAt =
    typeof value.updatedAt === 'number' && Number.isFinite(value.updatedAt)
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
  const step = Math.min(normalizeStep(value.step), unlockedStep) as WorkbenchStep;
  const title =
    typeof value.title === 'string'
      ? normalizeStoryTitle(value.title)
      : '';

  return {
    chapterCount,
    chapterRange: [rangeStart, rangeEnd],
    createdAt,
    id: value.id,
    idea: typeof value.idea === 'string' ? value.idea : '',
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

function createStoryId() {
  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function getDocumentStorageKey(storyId: string) {
  return `${STORY_DOCUMENT_STORAGE_PREFIX}${storyId}`;
}

function createSummary(story: StoryDocument): StorySummary {
  return {
    createdAt: story.createdAt,
    id: story.id,
    outlineChapterCount: story.outline.length,
    selectedChapter: story.selectedChapter,
    step: story.step,
    title: getStoryDisplayTitle(story),
    updatedAt: story.updatedAt,
  };
}

async function readStoryIndex(): Promise<StorySummary[]> {
  try {
    const storedValue = await AsyncStorage.getItem(STORY_INDEX_STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsed: unknown = JSON.parse(storedValue);
    const items =
      isRecord(parsed) &&
      parsed.version === STORY_STORAGE_VERSION &&
      Array.isArray(parsed.stories)
        ? parsed.stories
        : [];
    const storyIds = new Set<string>();

    return items
      .map(normalizeSummary)
      .filter((story): story is StorySummary => {
        if (!story || storyIds.has(story.id)) {
          return false;
        }

        storyIds.add(story.id);
        return true;
      })
      .sort((left, right) => right.updatedAt - left.updatedAt);
  } catch {
    return [];
  }
}

export function createStoryDocument(): StoryDocument {
  const now = Date.now();

  return {
    chapterCount: DEFAULT_CHAPTER_COUNT,
    chapterRange: [1, DEFAULT_CHAPTER_COUNT],
    createdAt: now,
    id: createStoryId(),
    idea: '',
    outline: [],
    selectedChapter: 1,
    step: 0,
    unlockedStep: 0,
    updatedAt: now,
    version: STORY_STORAGE_VERSION,
    wordsPerChapter: DEFAULT_WORDS_PER_CHAPTER,
  };
}

export function getStoryTitle(idea: string) {
  const normalizedIdea = idea.trim().replace(/\s+/g, ' ');

  if (!normalizedIdea) {
    return UNTITLED_STORY_TITLE;
  }

  const firstSentence =
    normalizedIdea.split(/[。！？.!?]/)[0]?.trim() || normalizedIdea;

  return firstSentence.length > 18
    ? `${firstSentence.slice(0, 18)}…`
    : firstSentence;
}

export function getStoryDisplayTitle(
  story: Pick<StoryDocument, 'idea' | 'title'>,
) {
  return normalizeStoryTitle(story.title ?? '') || getStoryTitle(story.idea);
}

export async function readStoryDocument(storyId: string) {
  await storageQueue.catch(() => {});

  try {
    const storedValue = await AsyncStorage.getItem(
      getDocumentStorageKey(storyId),
    );

    return storedValue
      ? normalizeDocument(JSON.parse(storedValue))
      : null;
  } catch {
    return null;
  }
}

export async function readLatestStoryDocument() {
  await storageQueue.catch(() => {});

  const summaries = await readStoryIndex();

  for (const summary of summaries) {
    const story = await readStoryDocument(summary.id);

    if (story) {
      return story;
    }
  }

  return null;
}

export function saveStoryDocument(story: StoryDocument) {
  const operation = storageQueue.catch(() => {}).then(async () => {
    const summaries = await readStoryIndex();
    const summary = createSummary(story);
    const nextSummaries = [
      summary,
      ...summaries.filter((item) => item.id !== story.id),
    ].sort((left, right) => right.updatedAt - left.updatedAt);

    await AsyncStorage.multiSet([
      [
        getDocumentStorageKey(story.id),
        JSON.stringify(story),
      ],
      [
        STORY_INDEX_STORAGE_KEY,
        JSON.stringify({
          stories: nextSummaries,
          version: STORY_STORAGE_VERSION,
        }),
      ],
    ]);
  });

  storageQueue = operation;
  return operation;
}

export async function createStory() {
  const story = createStoryDocument();

  await saveStoryDocument(story);
  return story;
}

export async function renameStory(storyId: string, title: string) {
  const normalizedTitle = normalizeStoryTitle(title);

  if (!normalizedTitle) {
    return null;
  }

  const story = await readStoryDocument(storyId);

  if (!story) {
    return null;
  }

  const nextStory: StoryDocument = {
    ...story,
    title: normalizedTitle,
    updatedAt: Date.now(),
  };

  await saveStoryDocument(nextStory);
  return createSummary(nextStory);
}

export async function readStorySummaries() {
  await storageQueue.catch(() => {});

  return readStoryIndex();
}
