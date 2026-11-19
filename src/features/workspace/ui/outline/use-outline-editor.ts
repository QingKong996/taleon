import { useState } from 'react';
import { Alert } from 'react-native';

import type {
  StoryOutlineChapter,
  StoryOutlineEntry,
} from '@/features/workspace/model/workbench-data';
import type { OutlineEditorTarget } from '@/features/workspace/ui/outline/outline-editor-target';

type UseOutlineEditorOptions = {
  appliedOutline: readonly StoryOutlineChapter[];
  disabled: boolean;
  onUpdateChapterOutline: (
    chapterNumber: number,
    changes: StoryOutlineEntry,
  ) => boolean;
  onUpdateSectionOutline: (
    chapterNumber: number,
    sectionIndex: number,
    changes: StoryOutlineEntry,
  ) => boolean;
};

export function useOutlineEditor({
  appliedOutline,
  disabled,
  onUpdateChapterOutline,
  onUpdateSectionOutline,
}: UseOutlineEditorOptions) {
  const [target, setTarget] = useState<OutlineEditorTarget | null>(
    null,
  );

  function openChapter(chapterNumber: number) {
    if (disabled) {
      return;
    }

    const chapter = appliedOutline.find(
      (item) => item.chapterNumber === chapterNumber,
    );

    if (!chapter) {
      return;
    }

    setTarget({
      chapterNumber: chapter.chapterNumber,
      kind: 'chapter',
      outline: chapter.outline,
      title: chapter.title,
    });
  }

  function openSection(
    chapterNumber: number,
    sectionIndex: number,
  ) {
    if (disabled) {
      return;
    }

    const section = appliedOutline.find(
      (chapter) => chapter.chapterNumber === chapterNumber,
    )?.sections[sectionIndex];

    if (!section) {
      return;
    }

    setTarget({
      chapterNumber,
      kind: 'section',
      outline: section.outline,
      sectionIndex,
      title: section.title,
    });
  }

  function save(changes: StoryOutlineEntry) {
    if (!target) {
      return;
    }

    const didUpdate =
      target.kind === 'chapter'
        ? onUpdateChapterOutline(target.chapterNumber, changes)
        : onUpdateSectionOutline(
            target.chapterNumber,
            target.sectionIndex,
            changes,
          );

    if (!didUpdate) {
      Alert.alert(
        '无法保存大纲',
        '大纲内容已发生变化，请重新打开编辑。',
      );
      return;
    }

    setTarget(null);
  }

  return {
    actions: {
      close: () => setTarget(null),
      openChapter,
      openSection,
      save,
    },
    target,
  };
}
