import type {
  StoryOutlineChapter,
  StoryOutlineSection,
} from '@/features/workspace/model/workbench-data';

type SectionContentPromptOptions = {
  chapterNumber: number;
  idea: string;
  outline: readonly StoryOutlineChapter[];
  sectionIndex: number;
  wordsPerChapter: number;
};

export function hasSectionContent(section: StoryOutlineSection) {
  return Boolean(section.content?.trim());
}

export function getCompletedSectionCount(
  chapter: StoryOutlineChapter,
) {
  return chapter.sections.filter(hasSectionContent).length;
}

export function isChapterContentComplete(chapter: StoryOutlineChapter) {
  return (
    chapter.sections.length > 0 &&
    chapter.sections.every(hasSectionContent)
  );
}

export function getChapterContentBlockReason(
  outline: readonly StoryOutlineChapter[],
  chapterNumber: number,
) {
  const chapter = outline.find(
    (item) => item.chapterNumber === chapterNumber,
  );

  if (!chapter) {
    return '当前章节还没有大纲，请先返回故事大纲生成。';
  }

  if (chapter.sections.length === 0) {
    return '当前章节还没有节大纲，请先在故事大纲中拆分章节。';
  }

  for (
    let previousNumber = 1;
    previousNumber < chapterNumber;
    previousNumber++
  ) {
    const previous = outline.find(
      (item) => item.chapterNumber === previousNumber,
    );

    if (!previous) {
      return `请先生成第 ${previousNumber} 章的大纲和正文。`;
    }

    if (previous.sections.length === 0) {
      return `请先生成第 ${previousNumber} 章的节大纲和正文。`;
    }

    const remainingSections = previous.sections.filter(
      (section) => !hasSectionContent(section),
    ).length;

    if (remainingSections > 0) {
      return `请先完成第 ${previousNumber} 章剩余 ${remainingSections} 节的正文。`;
    }
  }

  return null;
}

function formatSectionContent(
  section: StoryOutlineSection,
  sectionIndex: number,
) {
  return `第 ${sectionIndex + 1} 节《${section.title}》\n${
    section.content?.trim() ?? ''
  }`;
}

function formatChapterContent(chapter: StoryOutlineChapter) {
  const sections = chapter.sections
    .map(formatSectionContent)
    .join('\n\n');

  return [
    `第 ${chapter.chapterNumber} 章《${chapter.title}》`,
    sections,
  ].join('\n');
}

export function createSectionContentPrompt({
  chapterNumber,
  idea,
  outline,
  sectionIndex,
  wordsPerChapter,
}: SectionContentPromptOptions) {
  const chapter = outline.find(
    (item) => item.chapterNumber === chapterNumber,
  );
  const section = chapter?.sections[sectionIndex];

  if (!chapter || !section) {
    throw new Error('找不到要生成的章节或节');
  }

  const previousContent = [...outline]
    .filter((item) => item.chapterNumber < chapterNumber)
    .sort((left, right) => left.chapterNumber - right.chapterNumber)
    .map(formatChapterContent)
    .join('\n\n');
  const sectionOutlines = chapter.sections
    .map(
      (item, index) =>
        `${index + 1}. ${item.title}：${item.outline}`,
    )
    .join('\n');
  const previousSectionsContent = chapter.sections
    .slice(0, sectionIndex)
    .map((item, index) => ({ index, item }))
    .filter(({ item }) => hasSectionContent(item))
    .map(({ index, item }) => formatSectionContent(item, index))
    .join('\n\n');
  const targetLength = Math.max(
    1,
    Math.round(wordsPerChapter / chapter.sections.length),
  );

  return [
    `故事想法：${idea.trim()}`,
    `写作目标：完成第 ${chapter.chapterNumber} 章《${chapter.title}》第 ${
      sectionIndex + 1
    } 节《${section.title}》的正文。`,
    '【前文章节正文】\n' +
      (previousContent || '无前文章节正文。'),
    `【本章大纲】\n第 ${chapter.chapterNumber} 章《${chapter.title}》\n${chapter.outline}`,
    `【本章分节大纲】\n${sectionOutlines}`,
    previousSectionsContent
      ? `【本章已写正文】\n${previousSectionsContent}`
      : '',
    `【本节大纲】\n${section.title}：${section.outline}`,
    [
      '【写作要求】',
      '1. 只写本节正文，严格承接前文章节的人物、事实、时间线、伏笔和叙述语气。',
      '2. 严格按本章与本节大纲展开，不提前写后续节或后续章节的剧情。',
      '3. 用自然段写作，段与段之间空一行；不要写章名、节名、标题、小标题、列表、注释或写作说明。',
      '4. 保留必要的场景、动作、对白和人物内心，让本节有完整的起承转合，并在结尾留出向下一节推进的余韵。',
      `5. 本节目标篇幅约 ${targetLength} 字，可有约 20% 的浮动。`,
      '6. 只输出正文，不要 Markdown 代码块或任何前后缀。',
    ].join('\n'),
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function parseSectionContentResponse(text: string) {
  const trimmed = text.trim();

  if (!trimmed) {
    return '';
  }

  const fenced = trimmed.match(
    /```(?:markdown|md|text)?\s*\n?([\s\S]*?)\n?```/i,
  );

  return (fenced?.[1] ?? trimmed)
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .trim();
}
