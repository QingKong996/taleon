import { useEffect, useRef, useState } from 'react';

import type { OutlineGenerationResult } from '@/features/workspace/model/outline/outline-parser';
import { parseOutlineResponse } from '@/features/workspace/model/outline/outline-parser';
import type { StoryOutlineChapter } from '@/features/workspace/model/workbench-data';
import { findAvailableAssistantProvider } from '@/lib/assistant/provider';
import {
  getAssistantMessageText,
  streamAssistantMessage,
} from '@/lib/assistant/request';
import { useProviderSettings } from '@/providers/provider-settings';

const MAX_CHAPTERS_PER_REQUEST = 12;

const OUTLINE_SYSTEM_PROMPT = [
  '你是一名中文小说策划编辑，负责生成章节结构。',
  '只生成章名、节名和剧情大纲，不写正文、对白、环境描写或完整场景。',
  '只输出合法 JSON，不要 Markdown 代码块、解释、注释或前后缀。',
  'JSON 结构必须为：',
  '{"chapters":[{"title":"章名","outline":"本章剧情大纲","sections":[{"title":"节名","outline":"本节剧情大纲"}]}]}',
  'title 不要包含“第X章”或“第X节”前缀。',
].join('\n');

type OutlineGenerationOptions = {
  chapterCount: number;
  chapterRange: readonly [number, number];
  existingOutline: readonly StoryOutlineChapter[];
  idea: string;
  onPartialOutline?: (result: OutlineGenerationResult) => void;
  wordsPerChapter: number;
};

type OutlineProgress = {
  completed: number;
  total: number;
};

function createOutlineResult(
  chapters: readonly StoryOutlineChapter[],
  rangeStart: number,
  total: number,
): OutlineGenerationResult {
  const expectedChapterNumbers = Array.from(
    { length: total },
    (_, index) => rangeStart + index,
  );
  const generatedNumbers = new Set(
    chapters.map((chapter) => chapter.chapterNumber),
  );

  return {
    chapters: [...chapters],
    expectedChapterNumbers,
    missingChapterNumbers: expectedChapterNumbers.filter(
      (chapterNumber) => !generatedNumbers.has(chapterNumber),
    ),
  };
}

function formatContext(chapter: StoryOutlineChapter) {
  return `第 ${chapter.chapterNumber} 章《${chapter.title}》：${chapter.outline}`;
}

function createOutlinePrompt({
  chapterCount,
  chapterRange,
  contextAfter,
  contextBefore,
  idea,
  segmentEnd,
  segmentStart,
  total,
  wordsPerChapter,
}: {
  chapterCount: number;
  chapterRange: readonly [number, number];
  contextAfter?: StoryOutlineChapter;
  contextBefore?: StoryOutlineChapter;
  idea: string;
  segmentEnd: number;
  segmentStart: number;
  total: number;
  wordsPerChapter: number;
}) {
  const context = [
    contextBefore ? `前章衔接：${formatContext(contextBefore)}` : '',
    contextAfter ? `后章衔接：${formatContext(contextAfter)}` : '',
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
      '2. 每章拆成 2–3 节，按情节推进顺序排列。',
      '3. 章大纲用 50–90 字概括完整情节推进；节大纲用 25–50 字写明本节事件。',
      '4. 章节之间要有因果递进，结尾留下进入下一章的钩子。',
      '5. 只写剧情安排，不写正文。',
    ].join('\n'),
    '输出 JSON：',
    '{"chapters":[{"title":"章名","outline":"本章剧情大纲","sections":[{"title":"节名","outline":"本节剧情大纲"}]}]}',
  ].join('\n\n');
}

export function useOutlineGenerator() {
  const { configs, getProviderApiKey, isReady } = useProviderSettings();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<OutlineProgress>({
    completed: 0,
    total: 0,
  });
  const controllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  async function generateOutline({
    chapterCount,
    chapterRange,
    existingOutline,
    idea,
    onPartialOutline,
    wordsPerChapter,
  }: OutlineGenerationOptions): Promise<OutlineGenerationResult | null> {
    if (controllerRef.current) {
      return null;
    }

    if (!idea.trim()) {
      throw new Error('请先填写故事想法');
    }

    const [rangeStart, rangeEnd] = chapterRange;
    const total = rangeEnd - rangeStart + 1;
    const controller = new AbortController();
    controllerRef.current = controller;
    setIsGenerating(true);
    setProgress({ completed: 0, total });

    try {
      const { apiKey, config, modelId } =
        await findAvailableAssistantProvider(configs, getProviderApiKey);
      const generated: StoryOutlineChapter[] = [];

      for (
        let segmentStart = rangeStart;
        segmentStart <= rangeEnd;
        segmentStart += MAX_CHAPTERS_PER_REQUEST
      ) {
        if (controller.signal.aborted) {
          return null;
        }

        const segmentEnd = Math.min(
          rangeEnd,
          segmentStart + MAX_CHAPTERS_PER_REQUEST - 1,
        );
        const expectedCount = segmentEnd - segmentStart + 1;
        const previousGenerated = generated[generated.length - 1];
        const contextBefore =
          previousGenerated ??
          existingOutline.find(
            (chapter) => chapter.chapterNumber === segmentStart - 1,
          );
        const contextAfter = existingOutline.find(
          (chapter) =>
            chapter.chapterNumber === segmentEnd + 1 &&
            (chapter.chapterNumber < rangeStart ||
              chapter.chapterNumber > rangeEnd),
        );
        let streamedText = '';
        let lastPartialParseAt = 0;
        const message = await streamAssistantMessage({
          apiKey,
          config,
          input: createOutlinePrompt({
            chapterCount,
            chapterRange,
            contextAfter,
            contextBefore,
            idea,
            segmentEnd,
            segmentStart,
            total,
            wordsPerChapter,
          }),
          modelId,
          onTextDelta(delta) {
            streamedText += delta;

            if (
              !isMountedRef.current ||
              !delta.includes('}') ||
              Date.now() - lastPartialParseAt < 200
            ) {
              return;
            }

            const partialBatch = parseOutlineResponse(
              streamedText,
              segmentStart,
              expectedCount,
            );

            if (partialBatch.chapters.length === 0) {
              return;
            }

            lastPartialParseAt = Date.now();
            setProgress({
              completed:
                generated.length + partialBatch.chapters.length,
              total,
            });
            onPartialOutline?.(
              createOutlineResult(
                [...generated, ...partialBatch.chapters],
                rangeStart,
                total,
              ),
            );
          },
          signal: controller.signal,
          systemPrompt: OUTLINE_SYSTEM_PROMPT,
        });

        if (message.stopReason === 'error') {
          throw new Error(message.errorMessage ?? 'AI 请求失败');
        }

        const text = getAssistantMessageText(message);

        if (!text) {
          throw new Error('AI 未返回大纲');
        }

        const batch = parseOutlineResponse(
          text,
          segmentStart,
          expectedCount,
        );

        generated.push(...batch.chapters);

        if (isMountedRef.current) {
          onPartialOutline?.(createOutlineResult(generated, rangeStart, total));
          setProgress({
            completed: generated.length,
            total,
          });
        }
      }

      if (generated.length === 0) {
        throw new Error('AI 未返回可解析的大纲章节');
      }

      return createOutlineResult(generated, rangeStart, total);
    } catch (error) {
      if (controller.signal.aborted) {
        return null;
      }

      throw error;
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }

      if (isMountedRef.current) {
        setIsGenerating(false);
      }
    }
  }

  return {
    generateOutline,
    isGenerating,
    isReady,
    progress,
  };
}
