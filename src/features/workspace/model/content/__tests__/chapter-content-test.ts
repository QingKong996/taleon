import {
  createSectionContentPrompt,
  getChapterContentBlockReason,
  isChapterContentComplete,
  parseSectionContentResponse,
} from '@/features/workspace/model/content/chapter-content';
import type {
  StoryOutlineChapter,
} from '@/features/workspace/model/workbench-data';

function createChapter(
  chapterNumber: number,
  content?: string,
): StoryOutlineChapter {
  return {
    chapterNumber,
    outline: `第 ${chapterNumber} 章大纲`,
    sections: [
      {
        content,
        outline: `第 ${chapterNumber} 章第 1 节大纲`,
        title: `第 ${chapterNumber} 章节一`,
      },
    ],
    title: `第 ${chapterNumber} 章`,
  };
}

describe('chapter content generation', () => {
  test('blocks later chapters until every earlier section is generated', () => {
    const outline = [createChapter(1), createChapter(2)];

    expect(getChapterContentBlockReason(outline, 1)).toBeNull();
    expect(getChapterContentBlockReason(outline, 2)).toContain(
      '第 1 章剩余 1 节',
    );

    outline[0] = createChapter(1, '第一章正文');

    expect(isChapterContentComplete(outline[0])).toBe(true);
    expect(getChapterContentBlockReason(outline, 2)).toBeNull();
  });

  test('blocks a chapter when an earlier chapter outline is missing', () => {
    const outline = [createChapter(2, '第二章正文')];

    expect(getChapterContentBlockReason(outline, 2)).toContain(
      '第 1 章的大纲和正文',
    );
  });

  test('includes every earlier chapter body and the target outline', () => {
    const outline = [
      {
        ...createChapter(1, '第一章第一节正文'),
        sections: [
          {
            content: '第一章第一节正文',
            outline: '第一节大纲',
            title: '第一节',
          },
          {
            content: '第一章第二节正文',
            outline: '第二节大纲',
            title: '第二节',
          },
        ],
      },
      createChapter(2, '第二章独立正文'),
      createChapter(3),
    ];
    const prompt = createSectionContentPrompt({
      chapterNumber: 3,
      idea: '一个关于灯塔的故事',
      outline,
      sectionIndex: 0,
      wordsPerChapter: 2000,
    });

    expect(prompt).toContain('第一章第一节正文');
    expect(prompt).toContain('第一章第二节正文');
    expect(prompt).toContain('第二章独立正文');
    expect(prompt).toContain('第 3 章大纲');
    expect(prompt).toContain('第 3 章第 1 节大纲');
    expect(prompt).toContain('一个关于灯塔的故事');
  });

  test('removes markdown fences from streamed content', () => {
    expect(
      parseSectionContentResponse(
        '```markdown\n第一段。\n\n第二段。\n```',
      ),
    ).toBe('第一段。\n\n第二段。');
  });
});
