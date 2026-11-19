import type {
  StoryOutlineChapter,
  StoryOutlineEntry,
  StoryOutlineSection,
} from '@/features/workspace/model/workbench-data';
import { useOutlineEditor } from '@/features/workspace/ui/outline/use-outline-editor';
import { useOutlineGenerationWorkflow } from '@/features/workspace/ui/outline/use-outline-generation-workflow';

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
  const generation = useOutlineGenerationWorkflow({
    appliedOutline,
    chapterCount,
    chapterRange,
    idea,
    onApplyChapterSections,
    onApplyOutline,
    wordsPerChapter,
  });
  const editor = useOutlineEditor({
    appliedOutline,
    disabled:
      generation.status.isGenerating || generation.result.hasPreview,
    onUpdateChapterOutline,
    onUpdateSectionOutline,
  });

  return { editor, generation };
}
