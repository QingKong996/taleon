import { useState } from 'react';
import { Alert } from 'react-native';

import { getChapterContentBlockReason } from '@/features/workspace/model/content/chapter-content';
import { useChapterContentGenerator } from '@/features/workspace/model/content/use-chapter-content-generator';
import type { StoryOutlineChapter } from '@/features/workspace/model/workbench-data';

type UseChapterContentWorkflowOptions = {
  chapterNumber: number;
  chapters: readonly StoryOutlineChapter[];
  idea: string;
  onApplySectionContent: (
    chapterNumber: number,
    sectionIndex: number,
    content: string,
  ) => boolean;
  wordsPerChapter: number;
};

type StreamingContent = {
  chapterNumber: number;
  content: string;
  sectionIndex: number;
};

export function useChapterContentWorkflow({
  chapterNumber,
  chapters,
  idea,
  onApplySectionContent,
  wordsPerChapter,
}: UseChapterContentWorkflowOptions) {
  const { activeGeneration, generateSectionContent, isReady } =
    useChapterContentGenerator();
  const [streamingContent, setStreamingContent] =
    useState<StreamingContent | null>(null);
  const chapter =
    chapters.find((item) => item.chapterNumber === chapterNumber) ??
    chapters[0];
  const selectedChapterNumber = chapter?.chapterNumber ?? chapterNumber;
  const isGenerating = activeGeneration !== null;
  const blockReason = chapter
    ? getChapterContentBlockReason(chapters, chapter.chapterNumber)
    : null;
  const canGenerate =
    Boolean(chapter) && isReady && !isGenerating && !blockReason;

  async function generateSection(sectionIndex: number) {
    if (!chapter) {
      return;
    }

    if (blockReason) {
      Alert.alert('暂时无法生成正文', blockReason);
      return;
    }

    setStreamingContent({
      chapterNumber: chapter.chapterNumber,
      content: '',
      sectionIndex,
    });

    try {
      const content = await generateSectionContent({
        chapterNumber: chapter.chapterNumber,
        idea,
        onPartialContent(partialContent) {
          setStreamingContent({
            chapterNumber: chapter.chapterNumber,
            content: partialContent,
            sectionIndex,
          });
        },
        outline: chapters,
        sectionIndex,
        wordsPerChapter,
      });

      if (!content) {
        return;
      }

      if (
        !onApplySectionContent(
          chapter.chapterNumber,
          sectionIndex,
          content,
        )
      ) {
        Alert.alert(
          '无法保存正文',
          '章节状态已发生变化，请检查前文章节后重试。',
        );
      }
    } catch (error) {
      Alert.alert(
        '无法生成章节正文',
        error instanceof Error ? error.message : '请稍后重试',
      );
    } finally {
      setStreamingContent(null);
    }
  }

  return {
    activeGeneration,
    blockReason,
    canGenerate,
    chapter,
    generateSection,
    isGenerating,
    selectedChapterNumber,
    streamingContent,
  };
}
