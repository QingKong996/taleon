import { useEffect, useRef, useState } from 'react';

import type { OutlineGenerationResult } from '@/features/workspace/model/outline/outline-parser';
import {
  createOutlineResult,
  type ActiveGeneration,
  type OutlineProgress,
} from '@/features/workspace/model/outline/outline-generation';
import { requestOutlineDraft } from '@/features/workspace/model/outline/outline-request';
import { requestSectionDraft } from '@/features/workspace/model/outline/section-outline-request';
import {
  type ChapterSectionOptions,
  type OutlineGenerationOptions,
} from '@/features/workspace/model/outline/outline-prompts';
import type { StoryOutlineSection } from '@/features/workspace/model/workbench-data';
import { findAvailableAssistantProvider } from '@/lib/assistant/provider';
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
      const connection = await findAvailableAssistantProvider(
        configs,
        getProviderApiKey,
      );
      const generated = await requestOutlineDraft({
        chapterCount,
        chapterRange,
        connection,
        existingOutline,
        idea,
        onPartialChapters(chapters, completed) {
          if (!isMountedRef.current) {
            return;
          }

          setProgress({ completed, total });
          onPartialOutline?.(
            createOutlineResult(chapters, rangeStart, total),
          );
        },
        signal: controller.signal,
        wordsPerChapter,
      });

      if (controller.signal.aborted) {
        return null;
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

    if (sectionCount < 1) {
      throw new Error('节数至少为 1');
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setActiveGeneration({ chapterNumber, kind: 'sections' });

    try {
      const connection = await findAvailableAssistantProvider(
        configs,
        getProviderApiKey,
      );
      const sections = await requestSectionDraft({
        chapterCount,
        chapterNumber,
        connection,
        existingOutline,
        idea,
        onPartialSections(partialSections) {
          if (isMountedRef.current) {
            onPartialSections?.(partialSections);
          }
        },
        sectionCount,
        signal: controller.signal,
        wordsPerChapter,
      });

      if (controller.signal.aborted) {
        return null;
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
