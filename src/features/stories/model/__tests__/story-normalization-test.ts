import {
  normalizeStoryDocument,
  normalizeStorySummary,
} from '@/features/stories/model/story-normalization';
import { STORY_STORAGE_VERSION } from '@/features/stories/model/story-types';

describe('story normalization', () => {
  test('normalizes stored documents and drops invalid outline entries', () => {
    const story = normalizeStoryDocument({
      chapterCount: 3,
      chapterRange: [2, 99],
      createdAt: 100,
      id: 'story-1',
      idea: '  港口故事  ',
      outline: [
        {
          chapterNumber: 2,
          outline: ' 第二章大纲 ',
          sections: [
            {
              content: ' 正文 ',
              outline: ' 第一节大纲 ',
              title: ' 第一节 ',
            },
            { outline: '缺少标题' },
          ],
          title: ' 第二章 ',
        },
        {
          chapterNumber: 2,
          outline: '重复章节',
          sections: [],
          title: '重复',
        },
        {
          chapterNumber: 9,
          outline: '越界章节',
          sections: [],
          title: '越界',
        },
      ],
      selectedChapter: 9,
      step: 2,
      title: ' 港口 ',
      unlockedStep: 1,
      updatedAt: 200,
      version: STORY_STORAGE_VERSION,
      wordsPerChapter: 25000,
    });

    expect(story).toEqual({
      chapterCount: 3,
      chapterRange: [2, 3],
      createdAt: 100,
      id: 'story-1',
      idea: '  港口故事  ',
      outline: [
        {
          chapterNumber: 2,
          outline: '第二章大纲',
          sections: [
            {
              content: '正文',
              outline: '第一节大纲',
              title: '第一节',
            },
          ],
          title: '第二章',
        },
      ],
      selectedChapter: 3,
      step: 1,
      title: '港口',
      unlockedStep: 1,
      updatedAt: 200,
      version: STORY_STORAGE_VERSION,
      wordsPerChapter: 20000,
    });
  });

  test('fills missing optional document fields with defaults', () => {
    const story = normalizeStoryDocument({
      id: 'story-2',
      version: STORY_STORAGE_VERSION,
    });

    expect(story).toMatchObject({
      chapterCount: 12,
      chapterRange: [1, 12],
      id: 'story-2',
      outline: [],
      selectedChapter: 1,
      step: 0,
      unlockedStep: 0,
      version: STORY_STORAGE_VERSION,
      wordsPerChapter: 2000,
    });
    expect(story?.title).toBeUndefined();
  });

  test('rejects documents with an unknown version', () => {
    expect(
      normalizeStoryDocument({
        id: 'story-3',
        version: STORY_STORAGE_VERSION + 1,
      }),
    ).toBeNull();
  });

  test('normalizes summaries and falls back for missing titles', () => {
    expect(
      normalizeStorySummary({
        createdAt: 1,
        id: 'story-1',
        outlineChapterCount: 2.6,
        selectedChapter: 101,
        step: 2,
        title: '   ',
        updatedAt: 2,
      }),
    ).toEqual({
      createdAt: 1,
      id: 'story-1',
      outlineChapterCount: 3,
      selectedChapter: 100,
      step: 2,
      title: '未命名故事',
      updatedAt: 2,
    });
    expect(
      normalizeStorySummary({
        createdAt: 1,
        id: '',
        title: 'Story',
        updatedAt: 2,
      }),
    ).toBeNull();
  });
});
