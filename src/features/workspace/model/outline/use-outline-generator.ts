import { useEffect, useRef, useState } from 'react';

import type { OutlineGenerationResult } from '@/features/workspace/model/outline/outline-parser';
import {
  parseOutlineResponse,
  parseSectionOutlineResponse,
} from '@/features/workspace/model/outline/outline-parser';
import {
  createOutlineResult,
  MAX_CHAPTERS_PER_REQUEST,
  type ActiveGeneration,
  type OutlineProgress,
} from '@/features/workspace/model/outline/outline-generation';
import {
  createOutlinePrompt,
  createSectionOutlinePrompt,
  OUTLINE_SYSTEM_PROMPT,
  SECTION_OUTLINE_SYSTEM_PROMPT,
  type ChapterSectionOptions,
  type OutlineGenerationOptions,
} from '@/features/workspace/model/outline/outline-prompts';
import type {
  StoryOutlineChapter,
  StoryOutlineSection,
} from '@/features/workspace/model/workbench-data';
import { findAvailableAssistantProvider } from '@/lib/assistant/provider';
import {
  getAssistantMessageText,
  streamAssistantMessage,
} from '@/lib/assistant/request';
import { useProviderSettings } from '@/providers/provider-settings';

export function useOutlineGenerator() {
  const { configs, getProviderApiKey, isReady } = useProviderSettings();
  const [activeGeneration, setActiveGeneration] =
    useState<ActiveGeneration | null>(null);
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
      throw new Error('正在生成大纲，请稍候');
    }

    if (!idea.trim()) {
      throw new Error('请先填写故事想法');
    }

    const [rangeStart, rangeEnd] = chapterRange;
    const total = rangeEnd - rangeStart + 1;
    const controller = new AbortController();
    controllerRef.current = controller;
    setActiveGeneration({ kind: 'outline' });
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
            const partialChapters = partialBatch.chapters.map(
              (chapter) => ({ ...chapter, sections: [] }),
            );

            if (partialChapters.length === 0) {
              return;
            }

            lastPartialParseAt = Date.now();
            setProgress({
              completed: generated.length + partialChapters.length,
              total,
            });
            onPartialOutline?.(
              createOutlineResult(
                [...generated, ...partialChapters],
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
        const chapters = batch.chapters.map((chapter) => ({
          ...chapter,
          sections: [],
        }));

        generated.push(...chapters);

        if (isMountedRef.current) {
          onPartialOutline?.(
            createOutlineResult(generated, rangeStart, total),
          );
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
        setActiveGeneration(null);
      }
    }
  }

  async function generateChapterSections({
    chapterCount,
    chapterNumber,
    existingOutline,
    idea,
    onPartialSections,
    sectionCount,
    wordsPerChapter,
  }: ChapterSectionOptions): Promise<StoryOutlineSection[] | null> {
    if (controllerRef.current) {
      throw new Error('正在生成大纲，请稍候');
    }

    if (!idea.trim()) {
      throw new Error('请先填写故事想法');
    }

    const targetChapter = existingOutline.find(
      (chapter) => chapter.chapterNumber === chapterNumber,
    );

    if (!targetChapter) {
      throw new Error('请先生成该章大纲');
    }

    if (sectionCount < 1) {
      throw new Error('节数至少为 1');
    }

    const contextBefore = existingOutline.find(
      (chapter) => chapter.chapterNumber === chapterNumber - 1,
    );
    const contextAfter = existingOutline.find(
      (chapter) => chapter.chapterNumber === chapterNumber + 1,
    );
    const controller = new AbortController();
    controllerRef.current = controller;
    setActiveGeneration({ chapterNumber, kind: 'sections' });

    try {
      const { apiKey, config, modelId } =
        await findAvailableAssistantProvider(configs, getProviderApiKey);
      let streamedText = '';
      let lastPartialParseAt = 0;
      const message = await streamAssistantMessage({
        apiKey,
        config,
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
        signal: controller.signal,
        systemPrompt: SECTION_OUTLINE_SYSTEM_PROMPT,
      });

      if (message.stopReason === 'error') {
        throw new Error(message.errorMessage ?? 'AI 请求失败');
      }

      const text = getAssistantMessageText(message);

      if (!text) {
        throw new Error('AI 未返回节大纲');
      }

      const sections = parseSectionOutlineResponse(text, sectionCount);

      if (sections.length === 0) {
        throw new Error('AI 未返回可解析的节大纲');
      }

      return sections;
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
        setActiveGeneration(null);
      }
    }
  }

  return {
    activeGeneration,
    generateChapterSections,
    generateOutline,
    isReady,
    progress,
  };
}
