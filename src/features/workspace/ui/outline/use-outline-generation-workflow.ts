import { useState } from 'react';
import { Alert } from 'react-native';

import type { OutlineGenerationResult } from '@/features/workspace/model/outline/outline-parser';
import { useOutlineGenerator } from '@/features/workspace/model/outline/use-outline-generator';
import type {
  StoryOutlineChapter,
  StoryOutlineSection,
} from '@/features/workspace/model/workbench-data';
import {
  formatChapterRange,
  formatOutlineRange,
} from '@/features/workspace/ui/outline/outline-format';

type UseOutlineGenerationWorkflowOptions = {
  appliedOutline: readonly StoryOutlineChapter[];
  chapterCount: number;
  chapterRange: [number, number];
  idea: string;
  onApplyChapterSections: (
    chapterNumber: number,
    sections: readonly StoryOutlineSection[],
  ) => boolean;
  onApplyOutline: (
    chapters: readonly StoryOutlineChapter[],
    range?: readonly [number, number],
  ) => boolean;
  wordsPerChapter: number;
};

export function useOutlineGenerationWorkflow({
  appliedOutline,
  chapterCount,
  chapterRange,
  idea,
  onApplyChapterSections,
  onApplyOutline,
  wordsPerChapter,
}: UseOutlineGenerationWorkflowOptions) {
  const {
    activeGeneration,
    generateChapterSections: requestChapterSections,
    generateOutline: requestOutline,
    isReady,
    progress,
  } = useOutlineGenerator();
  const [preview, setPreview] =
    useState<OutlineGenerationResult | null>(null);
  const [sectionPreview, setSectionPreview] = useState<{
    chapterNumber: number;
    sections: readonly StoryOutlineSection[];
  } | null>(null);
  const isGenerating = activeGeneration !== null;
  const isGeneratingOutline = activeGeneration?.kind === 'outline';
  const generatingSectionsChapter =
    activeGeneration?.kind === 'sections'
      ? activeGeneration.chapterNumber
      : null;
  const rangeLabel = formatChapterRange(chapterRange);
  const expectedChapterCount = chapterRange[1] - chapterRange[0] + 1;
  const appliedChapters = appliedOutline.filter(
    (chapter) =>
      chapter.chapterNumber >= chapterRange[0] &&
      chapter.chapterNumber <= chapterRange[1],
  );
  const hasPreview = preview !== null && preview.chapters.length > 0;
  const outlineChapters = preview?.chapters ?? appliedChapters;
  const chapters =
    !hasPreview && sectionPreview
      ? outlineChapters.map((chapter) =>
          chapter.chapterNumber === sectionPreview.chapterNumber
            ? { ...chapter, sections: sectionPreview.sections }
            : chapter,
        )
      : outlineChapters;
  const canGenerate =
    idea.trim().length > 0 && isReady && !isGenerating;
  const generationLabel = isGeneratingOutline
    ? `正在生成 ${progress.completed}/${progress.total} 章`
    : generatingSectionsChapter
      ? `正在生成第 ${generatingSectionsChapter} 章的节大纲…`
      : '';

  async function generateOutlineDraft() {
    try {
      const generated = await requestOutline({
        chapterCount,
        chapterRange,
        existingOutline: appliedOutline,
        idea,
        onPartialOutline(result) {
          setPreview(result);
        },
        wordsPerChapter,
      });

      if (generated) {
        setPreview(generated);
      }
    } catch (error) {
      Alert.alert(
        '无法生成故事大纲',
        error instanceof Error ? error.message : '请稍后重试',
      );
    }
  }

  function applyOutlineDraft() {
    if (!preview || preview.chapters.length === 0 || isGenerating) {
      return;
    }

    const expectedStart = preview.expectedChapterNumbers[0];
    const expectedEnd =
      preview.expectedChapterNumbers[
        preview.expectedChapterNumbers.length - 1
      ];

    if (
      onApplyOutline(
        preview.chapters,
        expectedStart && expectedEnd
          ? [expectedStart, expectedEnd]
          : undefined,
      )
    ) {
      setPreview(null);
      return;
    }

    Alert.alert(
      '无法应用大纲',
      '生成范围已超出当前预计章数，请重新生成。',
    );
  }

  async function generateSections(
    chapterNumber: number,
    sectionCount: number,
  ) {
    setSectionPreview(null);

    try {
      const sections = await requestChapterSections({
        chapterCount,
        chapterNumber,
        existingOutline: appliedOutline,
        idea,
        onPartialSections(partialSections) {
          setSectionPreview({
            chapterNumber,
            sections: partialSections,
          });
        },
        sectionCount,
        wordsPerChapter,
      });

      if (!sections) {
        return;
      }

      if (!onApplyChapterSections(chapterNumber, sections)) {
        Alert.alert('无法应用节大纲', '请先生成该章大纲。');
        return;
      }

      if (sections.length < sectionCount) {
        Alert.alert(
          '节大纲未完整生成',
          `AI 返回了 ${sections.length}/${sectionCount} 节，可调整节数后重新生成。`,
        );
      }
    } catch (error) {
      Alert.alert(
        '无法生成节大纲',
        error instanceof Error ? error.message : '请稍后重试',
      );
    } finally {
      setSectionPreview(null);
    }
  }

  return {
    actions: {
      applyOutlineDraft,
      discardPreview: () => setPreview(null),
      generateChapterSections: generateSections,
      generateOutlineDraft,
    },
    result: {
      chapters,
      displayRangeLabel: hasPreview
        ? formatOutlineRange(preview?.chapters ?? [])
        : rangeLabel,
      expectedChapterCount,
      hasPreview,
      missingChapterNumbers: preview?.missingChapterNumbers ?? [],
      previewChapterCount: preview?.chapters.length ?? 0,
      previewExpectedCount:
        preview?.expectedChapterNumbers.length ?? 0,
      rangeLabel,
    },
    status: {
      canGenerate,
      generatingSectionsChapter,
      generationLabel,
      isGenerating,
      isGeneratingOutline,
    },
  };
}
