import { useEffect, useRef, useState } from 'react';

import {
  createSectionContentPrompt,
  getChapterContentBlockReason,
  parseSectionContentResponse,
} from '@/features/workspace/model/content/chapter-content';
import type {
  StoryOutlineChapter,
} from '@/features/workspace/model/workbench-data';
import { findAvailableAssistantProvider } from '@/lib/assistant/provider';
import {
  getAssistantMessageText,
  streamAssistantMessage,
} from '@/lib/assistant/request';
import { useProviderSettings } from '@/providers/provider-settings';

const SECTION_CONTENT_SYSTEM_PROMPT = [
  '你是一名擅长中文长篇小说的作家，负责按大纲写出连续的章节正文。',
  '必须服从用户提供的全书想法、前文正文、当前章大纲和当前节大纲。',
  '只输出当前节的小说正文，不要标题、列表、解释、注释、Markdown 或前后缀。',
  '保持人物、场景、时间线、伏笔和叙述语气与全部前文一致。',
].join('\n');

type ActiveContentGeneration = {
  chapterNumber: number;
  sectionIndex: number;
};

type GenerateSectionContentOptions = {
  chapterNumber: number;
  idea: string;
  onPartialContent?: (content: string) => void;
  outline: readonly StoryOutlineChapter[];
  sectionIndex: number;
  wordsPerChapter: number;
};

export function useChapterContentGenerator() {
  const { configs, getProviderApiKey, isReady } = useProviderSettings();
  const [activeGeneration, setActiveGeneration] =
    useState<ActiveContentGeneration | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  async function generateSectionContent({
    chapterNumber,
    idea,
    onPartialContent,
    outline,
    sectionIndex,
    wordsPerChapter,
  }: GenerateSectionContentOptions) {
    if (controllerRef.current) {
      throw new Error('正在生成本节内容，请稍候');
    }

    if (!idea.trim()) {
      throw new Error('请先填写故事想法');
    }

    const blockReason = getChapterContentBlockReason(
      outline,
      chapterNumber,
    );

    if (blockReason) {
      throw new Error(blockReason);
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setActiveGeneration({ chapterNumber, sectionIndex });

    try {
      const { apiKey, config, modelId } =
        await findAvailableAssistantProvider(configs, getProviderApiKey);
      let streamedText = '';
      const message = await streamAssistantMessage({
        apiKey,
        config,
        input: createSectionContentPrompt({
          chapterNumber,
          idea,
          outline,
          sectionIndex,
          wordsPerChapter,
        }),
        modelId,
        onTextDelta(delta) {
          streamedText += delta;

          if (isMountedRef.current) {
            onPartialContent?.(streamedText);
          }
        },
        signal: controller.signal,
        systemPrompt: SECTION_CONTENT_SYSTEM_PROMPT,
      });

      if (message.stopReason === 'error') {
        throw new Error(message.errorMessage ?? 'AI 请求失败');
      }

      const content = parseSectionContentResponse(
        getAssistantMessageText(message),
      );

      if (!content) {
        throw new Error('AI 未返回可用的正文');
      }

      return content;
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
    generateSectionContent,
    isReady,
  };
}
