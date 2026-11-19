import { useLayoutEffect, useRef, useState } from 'react';

import { getChapterContentBlockReason } from '@/features/workspace/model/content/chapter-content';
import type {
  StoryOutlineChapter,
  StoryOutlineEntry,
  StoryOutlineSection,
  WorkbenchSnapshot,
} from '@/features/workspace/model/workbench-data';
import type { OutlineUndoSnapshot } from '@/features/workspace/model/workbench/workbench-state';

type OutlineContext = {
  chapterRange: [number, number];
  selectedChapter: number;
};

export function useWorkbenchOutline(
  initialSnapshot: WorkbenchSnapshot | undefined,
  context: OutlineContext,
) {
  const initialOutline = initialSnapshot?.outline ?? [];
  const [chapters, setChapters] =
    useState<readonly StoryOutlineChapter[]>(initialOutline);
  const [previousOutline, setPreviousOutline] =
    useState<OutlineUndoSnapshot | null>(null);
  const chaptersRef = useRef(initialOutline);
  const previousOutlineRef = useRef<OutlineUndoSnapshot | null>(null);
  const contextRef = useRef(context);

  useLayoutEffect(() => {
    contextRef.current = context;
  }, [context]);

  function replaceOutline(nextChapters: readonly StoryOutlineChapter[]) {
    chaptersRef.current = nextChapters;
    setChapters(nextChapters);
  }

  function clearUndo() {
    previousOutlineRef.current = null;
    setPreviousOutline(null);
  }

  function commitOutline(nextChapters: readonly StoryOutlineChapter[]) {
    const undoSnapshot: OutlineUndoSnapshot = {
      chapters: chaptersRef.current,
      range: contextRef.current.chapterRange,
      selectedChapter: contextRef.current.selectedChapter,
    };

    previousOutlineRef.current = undoSnapshot;
    setPreviousOutline(undoSnapshot);
    replaceOutline(nextChapters);
  }

  function resetOutline() {
    replaceOutline([]);
    clearUndo();
  }

  function dropChaptersAbove(chapterCount: number) {
    const nextChapters = chaptersRef.current.filter(
      (chapter) => chapter.chapterNumber <= chapterCount,
    );

    if (nextChapters.length !== chaptersRef.current.length) {
      replaceOutline(nextChapters);
    }

    clearUndo();
  }

  function applyChapterSections(
    chapterNumber: number,
    sections: readonly StoryOutlineSection[],
  ) {
    const chapter = chaptersRef.current.find(
      (item) => item.chapterNumber === chapterNumber,
    );

    if (!chapter || sections.length === 0) {
      return false;
    }

    commitOutline(
      chaptersRef.current.map((item) =>
        item.chapterNumber === chapterNumber
          ? { ...item, sections }
          : item,
      ),
    );

    return true;
  }

  function applySectionContent(
    chapterNumber: number,
    sectionIndex: number,
    content: string,
  ) {
    const chapter = chaptersRef.current.find(
      (item) => item.chapterNumber === chapterNumber,
    );
    const section = chapter?.sections[sectionIndex];
    const normalizedContent = content.trim();

    if (
      !chapter ||
      !section ||
      !normalizedContent ||
      getChapterContentBlockReason(chaptersRef.current, chapterNumber)
    ) {
      return false;
    }

    if (section.content === normalizedContent) {
      return true;
    }

    commitOutline(
      chaptersRef.current.map((item) =>
        item.chapterNumber === chapterNumber
          ? {
              ...item,
              sections: item.sections.map((currentSection, index) =>
                index === sectionIndex
                  ? { ...currentSection, content: normalizedContent }
                  : currentSection,
              ),
            }
          : item,
      ),
    );

    return true;
  }

  function updateChapterOutline(
    chapterNumber: number,
    changes: StoryOutlineEntry,
  ) {
    const chapter = chaptersRef.current.find(
      (item) => item.chapterNumber === chapterNumber,
    );
    const title = changes.title.trim();
    const outline = changes.outline.trim();

    if (!chapter || !title || !outline) {
      return false;
    }

    if (chapter.title === title && chapter.outline === outline) {
      return true;
    }

    commitOutline(
      chaptersRef.current.map((item) =>
        item.chapterNumber === chapterNumber
          ? { ...item, title, outline }
          : item,
      ),
    );

    return true;
  }

  function updateSectionOutline(
    chapterNumber: number,
    sectionIndex: number,
    changes: StoryOutlineEntry,
  ) {
    const chapter = chaptersRef.current.find(
      (item) => item.chapterNumber === chapterNumber,
    );
    const section = chapter?.sections[sectionIndex];
    const title = changes.title.trim();
    const outline = changes.outline.trim();

    if (!chapter || !section || !title || !outline) {
      return false;
    }

    if (section.title === title && section.outline === outline) {
      return true;
    }

    commitOutline(
      chaptersRef.current.map((item) =>
        item.chapterNumber === chapterNumber
          ? {
              ...item,
              sections: item.sections.map((currentSection, index) =>
                index === sectionIndex
                  ? { ...currentSection, title, outline }
                  : currentSection,
              ),
            }
          : item,
      ),
    );

    return true;
  }

  function undoOutline() {
    const undoSnapshot = previousOutlineRef.current;

    if (!undoSnapshot) {
      return null;
    }

    clearUndo();
    replaceOutline(undoSnapshot.chapters);

    return undoSnapshot;
  }

  return {
    applyChapterSections,
    applySectionContent,
    canUndoOutline: previousOutline !== null,
    chapters,
    commitOutline,
    dropChaptersAbove,
    resetOutline,
    undoOutline,
    updateChapterOutline,
    updateSectionOutline,
  };
}
