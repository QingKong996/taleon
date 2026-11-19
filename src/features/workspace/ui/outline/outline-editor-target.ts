import type { StoryOutlineEntry } from '@/features/workspace/model/workbench-data';

export type OutlineEditorTarget = StoryOutlineEntry &
  (
    | {
        chapterNumber: number;
        kind: 'chapter';
      }
    | {
        chapterNumber: number;
        kind: 'section';
        sectionIndex: number;
      }
  );
