import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  normalizeStoryDocument,
  normalizeStorySummary,
} from '@/features/stories/model/story-normalization';
import {
  getStoryDisplayTitle,
  normalizeStoryTitle,
} from '@/features/stories/model/story-title';
import {
  STORY_STORAGE_VERSION,
  type StoryDocument,
  type StorySummary,
} from '@/features/stories/model/story-types';
import {
  DEFAULT_CHAPTER_COUNT,
  DEFAULT_WORDS_PER_CHAPTER,
} from '@/features/workspace/model/workbench-data';

const STORY_INDEX_STORAGE_KEY = ['taleon', 'stories', 'v1'].join('.');
const STORY_DOCUMENT_STORAGE_PREFIX = 'taleon.story.v1.';

let storageQueue: Promise<void> = Promise.resolve();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
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
      .map(normalizeStorySummary)
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

export async function readStoryDocument(storyId: string) {
  await storageQueue.catch(() => {});

  try {
    const storedValue = await AsyncStorage.getItem(
      getDocumentStorageKey(storyId),
    );

    return storedValue
      ? normalizeStoryDocument(JSON.parse(storedValue))
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
