import type { OutlineGenerationResult } from '@/features/workspace/model/outline/outline-parser';
import type {
  StoryOutlineChapter,
  StoryOutlineSection,
} from '@/features/workspace/model/workbench-data';

const OUTLINE_JSON_SHAPE =
  '{"chapters":[{"title":"章名","outline":"本章详细剧情大纲"}]}';

const SECTION_JSON_SHAPE =
  '{"sections":[{"title":"节名","outline":"本节详细剧情大纲"}]}';

const OUTLINE_SYSTEM_PROMPT = [
  '你是一名中文小说策划编辑，负责按范围细化章大纲。',
  '每次只为指定范围内的每个章节生成章名和章大纲，不生成节大纲或正文。',
  '只输出合法 JSON，不要 Markdown 代码块、解释、注释或前后缀。',
  'JSON 结构必须为：',
  OUTLINE_JSON_SHAPE,
  'title 不要包含“第X章”前缀。',
].join('\n');

const SECTION_OUTLINE_SYSTEM_PROMPT = [
  '你是一名中文小说策划编辑，负责把单章大纲细分为节。',
  '只生成用户指定数量的节名和节剧情大纲，不写正文、对白或完整场景。',
  '只输出合法 JSON，不要 Markdown 代码块、解释、注释或前后缀。',
  'JSON 结构必须为：',
  SECTION_JSON_SHAPE,
  'title 不要包含“第X节”前缀。',
].join('\n');

export type OutlineGenerationOptions = {
  chapterCount: number;
  chapterRange: readonly [number, number];
  existingOutline: readonly StoryOutlineChapter[];
  idea: string;
  onPartialOutline?: (result: OutlineGenerationResult) => void;
  wordsPerChapter: number;
};

export type ChapterSectionOptions = {
  chapterCount: number;
  chapterNumber: number;
  existingOutline: readonly StoryOutlineChapter[];
  idea: string;
  onPartialSections?: (sections: readonly StoryOutlineSection[]) => void;
  sectionCount: number;
  wordsPerChapter: number;
};

type OutlinePromptOptions = Omit<
  OutlineGenerationOptions,
  'existingOutline' | 'onPartialOutline'
> & {
  contextAfter?: StoryOutlineChapter;
  contextBefore?: StoryOutlineChapter;
  segmentEnd: number;
  segmentStart: number;
  total: number;
};

type SectionOutlinePromptOptions = Omit<
  ChapterSectionOptions,
  'existingOutline' | 'onPartialSections'
> & {
  contextAfter?: StoryOutlineChapter;
  contextBefore?: StoryOutlineChapter;
  targetChapter: StoryOutlineChapter;
};

function formatChapterContext(chapter: StoryOutlineChapter) {
  return `第 ${chapter.chapterNumber} 章《${chapter.title}》：${chapter.outline}`;
}

export function createOutlinePrompt({
  chapterCount,
  chapterRange,
  contextAfter,
  contextBefore,
  idea,
  segmentEnd,
  segmentStart,
  total,
  wordsPerChapter,
}: OutlinePromptOptions) {
  const context = [
    contextBefore ? `前章衔接：${formatChapterContext(contextBefore)}` : '',
    contextAfter ? `后章衔接：${formatChapterContext(contextAfter)}` : '',
  ].filter(Boolean);

  return [
    `故事想法：${idea.trim()}`,
    `全书计划：共 ${chapterCount} 章，每章约 ${wordsPerChapter} 字。`,
    `本次范围：全书第 ${chapterRange[0]}–${chapterRange[1]} 章，共 ${total} 章。`,
    `当前批次：第 ${segmentStart}–${segmentEnd} 章，共 ${segmentEnd - segmentStart + 1} 章。`,
    ...context,
    [
      '要求：',
      '1. 必须完整覆盖当前批次，每章输出一个章节对象，不得合并或遗漏。',
      '2. 每章只生成章名和章大纲，不得输出任何节大纲。',
      '3. 章名控制在 2–8 字；章大纲用 120–200 字，写清开场状态、核心事件、人物抉择、主要阻碍、结果与章末钩子。',
      '4. 事件必须有清晰的因果推进，并与前后章大纲自然衔接。',
      '5. 只写剧情安排，不写正文、对白或环境描写。',
    ].join('\n'),
    '输出 JSON：',
    OUTLINE_JSON_SHAPE,
  ].join('\n\n');
}

export function createSectionOutlinePrompt({
  chapterCount,
  chapterNumber,
  contextAfter,
  contextBefore,
  idea,
  sectionCount,
  targetChapter,
  wordsPerChapter,
}: SectionOutlinePromptOptions) {
  const sectionWords = Math.max(
    1,
    Math.round(wordsPerChapter / sectionCount),
  );
  const context = [
    contextBefore ? `前章衔接：${formatChapterContext(contextBefore)}` : '',
    `目标章：${formatChapterContext(targetChapter)}`,
    contextAfter ? `后章衔接：${formatChapterContext(contextAfter)}` : '',
  ].filter(Boolean);

  return [
    `故事想法：${idea.trim()}`,
    `全书计划：共 ${chapterCount} 章，每章约 ${wordsPerChapter} 字。`,
    `本次只为第 ${chapterNumber} 章生成节大纲。`,
    ...context,
    [
      '要求：',
      `1. 必须恰好输出 ${sectionCount} 节，不得遗漏、合并或额外增加。`,
      '2. 节名控制在 2–8 字，能区分本节的场景或关键事件。',
      '3. 每节大纲用 80–150 字，写清本节起始状态、人物行动或抉择、阻碍、结果和向下一个节推进的衔接。',
      '4. 各节按时间顺序完整覆盖本章大纲，避免重复情节，并在本章结尾形成有效钩子。',
      `5. 本章约 ${wordsPerChapter} 字，平均每节正文体量约 ${sectionWords} 字，据此把握每节的信息密度。`,
      '6. 只写剧情安排，不写正文、对白或环境描写。',
    ].join('\n'),
    '输出 JSON：',
    SECTION_JSON_SHAPE,
  ].join('\n\n');
}

export { OUTLINE_SYSTEM_PROMPT, SECTION_OUTLINE_SYSTEM_PROMPT };
