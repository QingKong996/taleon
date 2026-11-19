import { useState } from 'react';
import { Alert } from 'react-native';

import type { OutlineGenerationResult } from '@/features/workspace/model/outline/outline-parser';
import { useOutlineGenerator } from '@/features/workspace/model/outline/use-outline-generator';
import type {
  StoryOutlineChapter,
  StoryOutlineEntry,
  StoryOutlineSection,
} from '@/features/workspace/model/workbench-data';
import type { OutlineEditorTarget } from '@/features/workspace/ui/outline/outline-editor-modal';
import {
  formatChapterRange,
  formatOutlineRange,
} from '@/features/workspace/ui/outline/outline-format';

type UseOutlineWorkflowOptions = {
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
  onUpdateChapterOutline: (
    chapterNumber: number,
    changes: StoryOutlineEntry,
  ) => boolean;
  onUpdateSectionOutline: (
    chapterNumber: number,
    sectionIndex: number,
    changes: StoryOutlineEntry,
  ) => boolean;
  wordsPerChapter: number;
};

export function useOutlineWorkflow({
  appliedOutline,
  chapterCount,
  chapterRange,
  idea,
  onApplyChapterSections,
  onApplyOutline,
  onUpdateChapterOutline,
  onUpdateSectionOutline,
  wordsPerChapter,
}: UseOutlineWorkflowOptions) {
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
  const [editorTarget, setEditorTarget] =
    useState<OutlineEditorTarget | null>(null);
  const isGenerating = activeGeneration !== null;
  const isGeneratingOutline = activeGeneration?.kind === 'outline';
  const generatingSectionsChapter =
    activeGeneration?.kind === 'sections'
      ? activeGeneration.chapterNumber
      : null;
  const rangeLabel = formatChapterRange(chapterRange);
  const appliedChapters = appliedOutline.filter(
    (chapter) =>
      chapter.chapterNumber >= chapterRange[0] &&
      chapter.chapterNumber <= chapterRange[1],
  );
  const hasPreview = preview !== null && preview.chapters.length > 0;
  const outlineChapters = preview?.chapters ?? appliedChapters;
  const displayedChapters =
    !hasPreview && sectionPreview
      ? outlineChapters.map((chapter) =>
          chapter.chapterNumber === sectionPreview.chapterNumber
            ? { ...chapter, sections: sectionPreview.sections }
            : chapter,
        )
      : outlineChapters;
  const previewChapterCount = preview?.chapters.length ?? 0;
  const previewExpectedCount =
    preview?.expectedChapterNumbers.length ?? 0;
  const missingChapterNumbers = preview?.missingChapterNumbers ?? [];
  const displayRangeLabel = hasPreview
    ? formatOutlineRange(preview?.chapters ?? [])
    : rangeLabel;
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

  function openChapterEditor(chapterNumber: number) {
    if (hasPreview || isGenerating) {
      return;
    }

    const chapter = appliedOutline.find(
      (item) => item.chapterNumber === chapterNumber,
    );

    if (!chapter) {
      return;
    }

    setEditorTarget({
      chapterNumber: chapter.chapterNumber,
      kind: 'chapter',
      outline: chapter.outline,
      title: chapter.title,
    });
  }

  function openSectionEditor(
    chapterNumber: number,
    sectionIndex: number,
  ) {
    if (hasPreview || isGenerating) {
      return;
    }

    const section = appliedOutline.find(
      (chapter) => chapter.chapterNumber === chapterNumber,
    )?.sections[sectionIndex];

    if (!section) {
      return;
    }

    setEditorTarget({
      chapterNumber,
      kind: 'section',
      outline: section.outline,
      sectionIndex,
      title: section.title,
    });
  }

  function saveOutlineEditor(changes: StoryOutlineEntry) {
    if (!editorTarget) {
      return;
    }

    const didUpdate =
      editorTarget.kind === 'chapter'
        ? onUpdateChapterOutline(
            editorTarget.chapterNumber,
            changes,
          )
        : onUpdateSectionOutline(
            editorTarget.chapterNumber,
            editorTarget.sectionIndex,
            changes,
          );

    if (!didUpdate) {
      Alert.alert(
        '无法保存大纲',
        '大纲内容已发生变化，请重新打开编辑。',
      );
      return;
    }

    setEditorTarget(null);
  }

  return {
    applyOutlineDraft,
    canGenerate,
    closeEditor: () => setEditorTarget(null),
    discardPreview: () => setPreview(null),
    displayRangeLabel,
    displayedChapters,
    editorTarget,
    generateChapterSections: generateSections,
    generateOutlineDraft,
    generatingSectionsChapter,
    generationLabel,
    hasPreview,
    isGenerating,
    isGeneratingOutline,
    missingChapterNumbers,
    openChapterEditor,
    openSectionEditor,
    previewChapterCount,
    previewExpectedCount,
    rangeLabel,
    saveOutlineEditor,
  };
}
