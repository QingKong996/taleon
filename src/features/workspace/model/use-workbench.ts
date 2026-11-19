import { useMemo, useRef, useState } from 'react';

import {
  getChapterContentBlockReason,
} from '@/features/workspace/model/content/chapter-content';
import {
  DEFAULT_CHAPTER_COUNT,
  DEFAULT_WORDS_PER_CHAPTER,
  MAX_CHAPTER_COUNT,
  MAX_WORDS_PER_CHAPTER,
  MIN_CHAPTER_COUNT,
  MIN_WORDS_PER_CHAPTER,
  type StoryOutlineChapter,
  type StoryOutlineEntry,
  type StoryOutlineSection,
  type WorkbenchSnapshot,
  type WorkbenchStep,
} from '@/features/workspace/model/workbench-data';

function clamp(value: number, lower: number, upper: number) {
  return Math.min(Math.max(value, lower), upper);
}

function mergeOutline(
  current: readonly StoryOutlineChapter[],
  generated: readonly StoryOutlineChapter[],
) {
  const generatedNumbers = new Set(
    generated.map((chapter) => chapter.chapterNumber),
  );

  return [
    ...current.filter(
      (chapter) => !generatedNumbers.has(chapter.chapterNumber),
    ),
    ...generated,
  ].sort((left, right) => left.chapterNumber - right.chapterNumber);
}

type OutlineSnapshot = {
  chapters: readonly StoryOutlineChapter[];
  range: [number, number];
  selectedChapter: number;
};

export function useWorkbench(initialSnapshot?: WorkbenchSnapshot) {
  const [step, setStep] = useState<WorkbenchStep>(
    initialSnapshot?.step ?? 0,
  );
  const [unlockedStep, setUnlockedStep] = useState<WorkbenchStep>(
    initialSnapshot?.unlockedStep ?? 0,
  );
  const [idea, setIdea] = useState(initialSnapshot?.idea ?? '');
  const [chapterCount, setChapterCount] = useState(
    initialSnapshot?.chapterCount ?? DEFAULT_CHAPTER_COUNT,
  );
  const [chapterRange, setChapterRange] = useState<[number, number]>(
    initialSnapshot?.chapterRange ?? [1, DEFAULT_CHAPTER_COUNT],
  );
  const [wordsPerChapter, setWordsPerChapter] = useState(
    initialSnapshot?.wordsPerChapter ?? DEFAULT_WORDS_PER_CHAPTER,
  );
  const [selectedChapter, setSelectedChapter] = useState(
    initialSnapshot?.selectedChapter ?? 1,
  );
  const [outline, setOutline] = useState<readonly StoryOutlineChapter[]>(
    initialSnapshot?.outline ?? [],
  );
  const [previousOutline, setPreviousOutline] =
    useState<OutlineSnapshot | null>(null);
  const outlineRef = useRef<readonly StoryOutlineChapter[]>(
    initialSnapshot?.outline ?? [],
  );

  function replaceOutline(nextOutline: readonly StoryOutlineChapter[]) {
    outlineRef.current = nextOutline;
    setOutline(nextOutline);
  }

  function commitOutline(nextOutline: readonly StoryOutlineChapter[]) {
    setPreviousOutline({
      chapters: outlineRef.current,
      range: chapterRange,
      selectedChapter,
    });
    replaceOutline(nextOutline);
    setUnlockedStep(2);
  }

  function changeIdea(value: string) {
    setIdea(value);

    if (outlineRef.current.length > 0) {
      replaceOutline([]);
      setPreviousOutline(null);
      setChapterRange([1, chapterCount]);
      setSelectedChapter(1);
    }

    if (unlockedStep > 0) {
      setUnlockedStep(0);
    }
  }

  function openOutlineStep() {
    if (!idea.trim()) {
      return;
    }

    setSelectedChapter(1);
    setChapterRange([1, chapterCount]);
    setUnlockedStep(1);
    setStep(1);
  }

  function changeChapterCount(value: number) {
    const nextCount = clamp(
      Math.round(value),
      MIN_CHAPTER_COUNT,
      MAX_CHAPTER_COUNT,
    );

    setChapterCount(nextCount);
    const nextOutline = outlineRef.current.filter(
      (chapter) => chapter.chapterNumber <= nextCount,
    );

    if (nextOutline.length !== outlineRef.current.length) {
      replaceOutline(nextOutline);
    }

    setPreviousOutline(null);
    setChapterRange(([start, end]) => {
      if (start === 1 && end === chapterCount) {
        return [1, nextCount];
      }

      const nextEnd = Math.min(end, nextCount);

      return [Math.min(start, nextEnd), nextEnd];
    });
    setSelectedChapter((current) => Math.min(current, nextCount));
  }

  function changeChapterRange(range: [number, number]) {
    const start = clamp(
      Math.round(range[0]),
      MIN_CHAPTER_COUNT,
      chapterCount,
    );
    const end = clamp(
      Math.round(range[1]),
      start,
      chapterCount,
    );

    setChapterRange([start, end]);
  }

  function changeWordsPerChapter(value: number) {
    setWordsPerChapter(
      clamp(
        Math.round(value),
        MIN_WORDS_PER_CHAPTER,
        MAX_WORDS_PER_CHAPTER,
      ),
    );
  }

  function applyOutline(
    generated: readonly StoryOutlineChapter[],
    generatedRange?: readonly [number, number],
  ) {
    const applicable = generated.filter(
      (chapter) => chapter.chapterNumber <= chapterCount,
    );

    if (applicable.length === 0) {
      return false;
    }

    commitOutline(mergeOutline(outlineRef.current, applicable));
    const nextRangeStart = generatedRange
      ? clamp(generatedRange[0], MIN_CHAPTER_COUNT, chapterCount)
      : applicable[0].chapterNumber;
    const nextRangeEnd = generatedRange
      ? clamp(generatedRange[1], nextRangeStart, chapterCount)
      : applicable[applicable.length - 1].chapterNumber;

    setChapterRange([nextRangeStart, nextRangeEnd]);
    setSelectedChapter((current) =>
      applicable.some((chapter) => chapter.chapterNumber === current)
        ? current
        : applicable[0].chapterNumber,
    );

    return true;
  }

  function applyChapterSections(
    chapterNumber: number,
    sections: readonly StoryOutlineSection[],
  ) {
    const chapter = outlineRef.current.find(
      (item) => item.chapterNumber === chapterNumber,
    );

    if (!chapter || sections.length === 0) {
      return false;
    }

    commitOutline(
      outlineRef.current.map((item) =>
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
    const chapter = outlineRef.current.find(
      (item) => item.chapterNumber === chapterNumber,
    );
    const section = chapter?.sections[sectionIndex];
    const normalizedContent = content.trim();

    if (
      !chapter ||
      !section ||
      !normalizedContent ||
      getChapterContentBlockReason(outlineRef.current, chapterNumber)
    ) {
      return false;
    }

    if (section.content === normalizedContent) {
      return true;
    }

    commitOutline(
      outlineRef.current.map((item) =>
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
    const chapter = outlineRef.current.find(
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
      outlineRef.current.map((item) =>
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
    const chapter = outlineRef.current.find(
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
      outlineRef.current.map((item) =>
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
    if (!previousOutline) {
      return;
    }

    replaceOutline(previousOutline.chapters);
    setChapterRange(previousOutline.range);
    setSelectedChapter(previousOutline.selectedChapter);
    setPreviousOutline(null);
    setUnlockedStep(previousOutline.chapters.length > 0 ? 2 : 1);
  }

  function openStep(nextStep: WorkbenchStep) {
    if (nextStep <= unlockedStep) {
      setStep(nextStep);
    }
  }

  const snapshot = useMemo<WorkbenchSnapshot>(
    () => ({
      chapterCount,
      chapterRange,
      idea,
      outline,
      selectedChapter,
      step,
      unlockedStep,
      wordsPerChapter,
    }),
    [
      chapterCount,
      chapterRange,
      idea,
      outline,
      selectedChapter,
      step,
      unlockedStep,
      wordsPerChapter,
    ],
  );

  return {
    applyChapterSections,
    applyOutline,
    applySectionContent,
    canUndoOutline: previousOutline !== null,
    chapterCount,
    chapterRange,
    changeIdea,
    changeChapterCount,
    changeChapterRange,
    changeWordsPerChapter,
    idea,
    openOutlineStep,
    openStep,
    outline,
    selectedChapter,
    setSelectedChapter,
    setStep,
    snapshot,
    step,
    undoOutline,
    unlockedStep,
    updateChapterOutline,
    updateSectionOutline,
    wordsPerChapter,
  };
}
