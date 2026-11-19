import { parseOutlineResponse } from '@/features/workspace/model/outline/outline-parser';
import { MAX_CHAPTERS_PER_REQUEST } from '@/features/workspace/model/outline/outline-generation';
import {
  createOutlinePrompt,
  OUTLINE_SYSTEM_PROMPT,
} from '@/features/workspace/model/outline/outline-prompts';
import {
  assertSuccessfulMessage,
  PARTIAL_PARSE_INTERVAL_MS,
} from '@/features/workspace/model/outline/outline-request-utils';
import type { StoryOutlineChapter } from '@/features/workspace/model/workbench-data';
import type { AvailableAssistantProvider } from '@/lib/assistant/provider';
import {
  getAssistantMessageText,
  streamAssistantMessage,
} from '@/lib/assistant/request';

type OutlineDraftRequestOptions = {
  chapterCount: number;
  chapterRange: readonly [number, number];
  connection: AvailableAssistantProvider;
  existingOutline: readonly StoryOutlineChapter[];
  idea: string;
  onPartialChapters?: (
    chapters: readonly StoryOutlineChapter[],
    completed: number,
  ) => void;
  signal: AbortSignal;
  wordsPerChapter: number;
};

function parseChapters(
  text: string,
  startChapter: number,
  expectedCount: number,
) {
  return parseOutlineResponse(
    text,
    startChapter,
    expectedCount,
  ).chapters.map((chapter) => ({ ...chapter, sections: [] }));
}

export async function requestOutlineDraft({
  chapterCount,
  chapterRange,
  connection,
  existingOutline,
  idea,
  onPartialChapters,
  signal,
  wordsPerChapter,
}: OutlineDraftRequestOptions) {
  const [rangeStart, rangeEnd] = chapterRange;
  const total = rangeEnd - rangeStart + 1;
  const generated: StoryOutlineChapter[] = [];

  for (
    let segmentStart = rangeStart;
    segmentStart <= rangeEnd;
    segmentStart += MAX_CHAPTERS_PER_REQUEST
  ) {
    if (signal.aborted) {
      return generated;
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
      apiKey: connection.apiKey,
      config: connection.config,
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
      modelId: connection.modelId,
      onTextDelta(delta) {
        streamedText += delta;

        if (
          !delta.includes('}') ||
          Date.now() - lastPartialParseAt <
            PARTIAL_PARSE_INTERVAL_MS
        ) {
          return;
        }

        const partialChapters = parseChapters(
          streamedText,
          segmentStart,
          expectedCount,
        );

        if (partialChapters.length === 0) {
          return;
        }

        lastPartialParseAt = Date.now();
        onPartialChapters?.(
          [...generated, ...partialChapters],
          generated.length + partialChapters.length,
        );
      },
      signal,
      systemPrompt: OUTLINE_SYSTEM_PROMPT,
    });

    assertSuccessfulMessage(message.stopReason, message.errorMessage);

    const text = getAssistantMessageText(message);

    if (!text) {
      throw new Error('AI 未返回大纲');
    }

    generated.push(
      ...parseChapters(text, segmentStart, expectedCount),
    );
    onPartialChapters?.(generated, generated.length);
  }

  if (generated.length === 0) {
    throw new Error('AI 未返回可解析的大纲章节');
  }

  return generated;
}
