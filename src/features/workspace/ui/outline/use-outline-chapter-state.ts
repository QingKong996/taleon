import { useState } from 'react';

import {
  DEFAULT_SECTION_COUNT,
  MAX_SECTION_COUNT,
  MIN_SECTION_COUNT,
  type StoryOutlineChapter,
} from '@/features/workspace/model/workbench-data';

export function useOutlineChapterState({
  initiallyExpanded,
  sections,
}: {
  initiallyExpanded: boolean;
  sections: StoryOutlineChapter['sections'];
}) {
  const [expanded, setExpanded] = useState(
    initiallyExpanded || sections.length > 0,
  );
  const [sectionCount, setSectionCount] = useState(
    sections.length > 0
      ? Math.min(
          MAX_SECTION_COUNT,
          Math.max(MIN_SECTION_COUNT, sections.length),
        )
      : DEFAULT_SECTION_COUNT,
  );

  return {
    expanded,
    sectionCount,
    setSectionCount,
    toggleExpanded: () => setExpanded((current) => !current),
  };
}
