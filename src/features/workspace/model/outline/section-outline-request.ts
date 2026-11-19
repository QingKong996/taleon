import { parseSectionOutlineResponse } from '@/features/workspace/model/outline/outline-parser';
import {
  createSectionOutlinePrompt,
  SECTION_OUTLINE_SYSTEM_PROMPT,
} from '@/features/workspace/model/outline/outline-prompts';
import {
  assertSuccessfulMessage,
  PARTIAL_PARSE_INTERVAL_MS,
} from '@/features/workspace/model/outline/outline-request-utils';
import type {
  StoryOutlineChapter,
  StoryOutlineSection,
} from '@/features/workspace/model/workbench-data';
import type { AvailableAssistantProvider } from '@/lib/assistant/provider';
import {
  getAssistantMessageText,
  streamAssistantMessage,
} from '@/lib/assistant/request';

type SectionDraftRequestOptions = {
  chapterCount: number;
  chapterNumber: number;
  connection: AvailableAssistantProvider;
  existingOutline: readonly StoryOutlineChapter[];
  idea: string;
  onPartialSections?: (
    sections: readonly StoryOutlineSection[],
  ) => void;
  sectionCount: number;
  signal: AbortSignal;
  wordsPerChapter: number;
};

export async function requestSectionDraft({
  chapterCount,
  chapterNumber,
  connection,
  existingOutline,
  idea,
  onPartialSections,
  sectionCount,
  signal,
  wordsPerChapter,
}: SectionDraftRequestOptions) {
  const targetChapter = existingOutline.find(
    (chapter) => chapter.chapterNumber === chapterNumber,
  );

  if (!targetChapter) {
    throw new Error('请先生成该章大纲');
  }

  const contextBefore = existingOutline.find(
    (chapter) => chapter.chapterNumber === chapterNumber - 1,
  );
  const contextAfter = existingOutline.find(
    (chapter) => chapter.chapterNumber === chapterNumber + 1,
  );
  let streamedText = '';
  let lastPartialParseAt = 0;
  const message = await streamAssistantMessage({
    apiKey: connection.apiKey,
    config: connection.config,
    input: createSectionOutlinePrompt({
      chapterCount,
      chapterNumber,
      contextAfter,
      contextBefore,
      idea,
      sectionCount,
      targetChapter,
      wordsPerChapter,
    }),
    modelId: connection.modelId,
    onTextDelta(delta) {
      streamedText += delta;

      if (
        !delta.includes('}') ||
        Date.now() - lastPartialParseAt < PARTIAL_PARSE_INTERVAL_MS
      ) {
        return;
      }

      const partialSections = parseSectionOutlineResponse(
        streamedText,
        sectionCount,
      );

      if (partialSections.length === 0) {
        return;
      }

      lastPartialParseAt = Date.now();
      onPartialSections?.(partialSections);
    },
    signal,
    systemPrompt: SECTION_OUTLINE_SYSTEM_PROMPT,
  });

  assertSuccessfulMessage(message.stopReason, message.errorMessage);

  const text = getAssistantMessageText(message);

  if (!text) {
    throw new Error('AI 未返回节大纲');
  }

  const sections = parseSectionOutlineResponse(text, sectionCount);

  if (sections.length === 0) {
    throw new Error('AI 未返回可解析的节大纲');
  }

  return sections;
}
