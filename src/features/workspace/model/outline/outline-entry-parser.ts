import type {
  StoryOutlineChapter,
  StoryOutlineSection,
} from '@/features/workspace/model/workbench-data';
import {
  parseLeadingChapterNumber,
  readChapterNumberValue,
} from '@/features/workspace/model/outline/outline-number';
import {
  isRecord,
  readOptionalString,
  readString,
  type UnknownRecord,
} from '@/features/workspace/model/outline/record-utils';

export type ParsedChapter = {
  content: Omit<StoryOutlineChapter, 'chapterNumber'>;
  explicitNumber: number | null;
};

const CHAPTER_TITLE_KEYS = ['title', 'name', 'chapterTitle'] as const;
const CHAPTER_OUTLINE_KEYS = [
  'outline',
  'summary',
  'synopsis',
  'chapterOutline',
] as const;
const SECTION_KEYS = ['sections', 'beats', 'sectionList'] as const;
const SECTION_TITLE_KEYS = ['title', 'name'] as const;
const SECTION_OUTLINE_KEYS = [
  'outline',
  'summary',
  'synopsis',
] as const;

function normalizeTitle(value: string, kind: '章' | '节') {
  const title = value
    .replace(
      new RegExp(
        `^第[0-9一二三四五六七八九十百千万两零〇]+${kind}\\s*[：:.\\-、]?\\s*`,
      ),
      '',
    )
    .trim();

  if (!title) {
    throw new Error(`AI 返回了空的${kind}名`);
  }

  return title;
}

function getSectionValue(record: UnknownRecord) {
  for (const key of SECTION_KEYS) {
    if (Array.isArray(record[key])) {
      return record[key];
    }
  }

  return null;
}

export function parseSections(value: unknown): StoryOutlineSection[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const sections: StoryOutlineSection[] = [];

  for (const rawSection of value) {
    if (!isRecord(rawSection)) {
      continue;
    }

    try {
      sections.push({
        title: normalizeTitle(
          readString(rawSection, SECTION_TITLE_KEYS, '节名'),
          '节',
        ),
        outline: readString(
          rawSection,
          SECTION_OUTLINE_KEYS,
          '分节大纲',
        ),
      });
    } catch {
      continue;
    }
  }

  return sections;
}

export function isSectionCandidate(record: UnknownRecord) {
  return Boolean(
    readOptionalString(record, SECTION_TITLE_KEYS) &&
      readOptionalString(record, SECTION_OUTLINE_KEYS),
  );
}

export function findSectionRecords(
  value: unknown,
  depth = 0,
): unknown[] | null {
  if (depth > 3) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.some(isSectionCandidate) ? value : null;
  }

  if (!isRecord(value)) {
    return null;
  }

  for (const key of SECTION_KEYS) {
    const nested = value[key];

    if (Array.isArray(nested) && nested.some(isSectionCandidate)) {
      return nested;
    }
  }

  for (const key of ['data', 'result', 'chapter']) {
    const nested = value[key];

    if (isRecord(nested) || Array.isArray(nested)) {
      const sections = findSectionRecords(nested, depth + 1);

      if (sections) {
        return sections;
      }
    }
  }

  return isSectionCandidate(value) ? [value] : null;
}

function readExplicitChapterNumber(
  record: UnknownRecord,
  title: string,
) {
  for (const key of ['chapterNumber', 'chapter', 'number', 'index']) {
    const number = readChapterNumberValue(record[key]);

    if (number) {
      return number;
    }
  }

  return parseLeadingChapterNumber(title);
}

export function isChapterCandidate(record: UnknownRecord) {
  const title = readOptionalString(record, CHAPTER_TITLE_KEYS);

  if (!title) {
    return false;
  }

  return (
    getSectionValue(record) !== null ||
    readExplicitChapterNumber(record, title) !== null ||
    readOptionalString(record, CHAPTER_OUTLINE_KEYS) !== null
  );
}

export function parseChapter(
  record: UnknownRecord,
): ParsedChapter | null {
  try {
    const rawTitle = readString(record, CHAPTER_TITLE_KEYS, '章名');

    return {
      content: {
        title: normalizeTitle(rawTitle, '章'),
        outline: readString(
          record,
          CHAPTER_OUTLINE_KEYS,
          '本章大纲',
        ),
        sections: parseSections(getSectionValue(record)),
      },
      explicitNumber: readExplicitChapterNumber(record, rawTitle),
    };
  } catch {
    return null;
  }
}

export type ChapterRecordSource = {
  records: unknown[];
  trusted: boolean;
};

export function findChapterRecords(
  value: unknown,
  depth = 0,
): ChapterRecordSource | null {
  if (depth > 2) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.some(isChapterCandidate)
      ? { records: value, trusted: true }
      : null;
  }

  if (!isRecord(value)) {
    return null;
  }

  for (const key of ['chapters', 'data', 'result']) {
    const nested = value[key];

    if (key === 'chapters' && Array.isArray(nested)) {
      return { records: nested, trusted: true };
    }

    if (Array.isArray(nested) && nested.some(isChapterCandidate)) {
      return { records: nested, trusted: true };
    }

    if (isRecord(nested)) {
      const chapters = findChapterRecords(nested, depth + 1);

      if (chapters) {
        return chapters;
      }
    }
  }

  return isChapterCandidate(value)
    ? { records: [value], trusted: true }
    : null;
}
