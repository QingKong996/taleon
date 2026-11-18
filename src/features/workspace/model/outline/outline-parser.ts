import type {
  StoryOutlineChapter,
  StoryOutlineSection,
} from '@/features/workspace/model/workbench-data';

export type OutlineGenerationResult = {
  chapters: StoryOutlineChapter[];
  expectedChapterNumbers: number[];
  missingChapterNumbers: number[];
};

export type ParsedOutlineBatch = {
  chapters: StoryOutlineChapter[];
  expectedChapterNumbers: number[];
  missingChapterNumbers: number[];
};

type UnknownRecord = Record<string, unknown>;

type ParsedChapter = {
  content: Omit<StoryOutlineChapter, 'chapterNumber'>;
  explicitNumber: number | null;
};

const CHINESE_DIGITS: Record<string, number> = {
  零: 0,
  〇: 0,
  一: 1,
  二: 2,
  两: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
};

const CHINESE_UNITS: Record<string, number> = {
  十: 10,
  百: 100,
  千: 1000,
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readOptionalString(
  record: UnknownRecord,
  keys: readonly string[],
) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function readString(
  record: UnknownRecord,
  keys: readonly string[],
  label: string,
) {
  const value = readOptionalString(record, keys);

  if (!value) {
    throw new Error(`AI 返回的大纲缺少${label}`);
  }

  return value;
}

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
  for (const key of ['sections', 'beats', 'sectionList']) {
    if (Array.isArray(record[key])) {
      return record[key];
    }
  }

  return null;
}

function parseSections(value: unknown): StoryOutlineSection[] {
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
          readString(rawSection, ['title', 'name'], '节名'),
          '节',
        ),
        outline: readString(
          rawSection,
          ['outline', 'summary', 'synopsis'],
          '分节大纲',
        ),
      });
    } catch {
      continue;
    }
  }

  return sections;
}

function parseChineseNumber(value: string) {
  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  let total = 0;
  let current = 0;
  let hasValue = false;

  for (const character of value) {
    const digit = CHINESE_DIGITS[character];

    if (digit !== undefined) {
      current = digit;
      hasValue = true;
      continue;
    }

    const unit = CHINESE_UNITS[character];

    if (unit === undefined) {
      return null;
    }

    total += (current || 1) * unit;
    current = 0;
    hasValue = true;
  }

  return hasValue ? total + current : null;
}

function parseChapterNumber(value: string) {
  const normalized = value.normalize('NFKC').trim();

  if (/^\d+$/.test(normalized)) {
    return Number(normalized);
  }

  return (
    parseLeadingChapterNumber(normalized) ??
    parseChineseNumber(normalized)
  );
}

function parseLeadingChapterNumber(value: string) {
  const normalized = value.normalize('NFKC').trim();
  const match = normalized.match(
    /^第\s*([0-9一二三四五六七八九十百千万两零〇]+)\s*章/,
  );

  return match ? parseChineseNumber(match[1]) : null;
}

function readChapterNumberValue(value: unknown) {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0 ? value : null;
  }

  if (typeof value === 'string') {
    return parseChapterNumber(value);
  }

  return null;
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

function isChapterCandidate(record: UnknownRecord) {
  const title = readOptionalString(record, [
    'title',
    'name',
    'chapterTitle',
  ]);

  if (!title) {
    return false;
  }

  return (
    getSectionValue(record) !== null ||
    readExplicitChapterNumber(record, title) !== null
  );
}

function parseChapter(record: UnknownRecord): ParsedChapter | null {
  try {
    const rawTitle = readString(
      record,
      ['title', 'name', 'chapterTitle'],
      '章名',
    );

    return {
      content: {
        title: normalizeTitle(rawTitle, '章'),
        outline: readString(
          record,
          ['outline', 'summary', 'synopsis', 'chapterOutline'],
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

function escapeControlCharactersInStrings(value: string) {
  let result = '';
  let escaped = false;
  let inString = false;

  for (const character of value) {
    if (!inString) {
      result += character;

      if (character === '"') {
        inString = true;
      }

      continue;
    }

    if (escaped) {
      result += character;
      escaped = false;
      continue;
    }

    if (character === '\\') {
      result += character;
      escaped = true;
      continue;
    }

    if (character === '"') {
      result += character;
      inString = false;
      continue;
    }

    if (character === '\n') {
      result += '\\n';
      continue;
    }

    if (character === '\r') {
      result += '\\r';
      continue;
    }

    if (character === '\t') {
      result += '\\t';
      continue;
    }

    if (character.charCodeAt(0) < 0x20) {
      result += `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`;
      continue;
    }

    result += character;
  }

  return result;
}

function removeTrailingCommas(value: string) {
  let result = '';
  let escaped = false;
  let inString = false;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];

    if (!inString) {
      if (character === '"') {
        inString = true;
        result += character;
        continue;
      }

      if (character === ',') {
        let nextIndex = index + 1;

        while (/\s/.test(value[nextIndex] ?? '')) {
          nextIndex += 1;
        }

        if (value[nextIndex] === '}' || value[nextIndex] === ']') {
          continue;
        }
      }

      result += character;
      continue;
    }

    if (escaped) {
      result += character;
      escaped = false;
      continue;
    }

    if (character === '\\') {
      result += character;
      escaped = true;
      continue;
    }

    if (character === '"') {
      inString = false;
    }

    result += character;
  }

  return result;
}

function parseJsonText(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    // Try the lightweight syntax repairs below.
  }

  const repaired = removeTrailingCommas(
    escapeControlCharactersInStrings(value),
  );

  try {
    return JSON.parse(repaired) as unknown;
  } catch {
    return undefined;
  }
}

function createJsonCandidates(text: string) {
  const trimmed = text.replace(/^\uFEFF/, '').trim();
  const candidates = [trimmed];
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fenced?.[1]) {
    candidates.push(fenced[1].trim());
  }

  const objectStart = trimmed.indexOf('{');
  const arrayStart = trimmed.indexOf('[');
  const validStarts = [objectStart, arrayStart].filter(
    (position) => position >= 0,
  );
  const start = validStarts.length > 0 ? Math.min(...validStarts) : -1;
  const end = Math.max(trimmed.lastIndexOf('}'), trimmed.lastIndexOf(']'));

  if (start >= 0 && end > start) {
    candidates.push(trimmed.slice(start, end + 1));
  }

  return [...new Set(candidates)].filter(Boolean);
}

function parseJsonPayload(text: string) {
  for (const candidate of createJsonCandidates(text)) {
    const parsed = parseJsonText(candidate);

    if (parsed !== undefined) {
      return parsed;
    }
  }

  return undefined;
}

type ChapterRecordSource = {
  records: unknown[];
  trusted: boolean;
};

function findChapterRecords(
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

function findObjectSpans(text: string) {
  const spans: Array<{ start: number; end: number }> = [];
  const starts: number[] = [];
  let escaped = false;
  let inString = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }

      continue;
    }

    if (character === '"') {
      inString = true;
    } else if (character === '{') {
      starts.push(index);
    } else if (character === '}') {
      const start = starts.pop();

      if (start !== undefined) {
        spans.push({ start, end: index });
      }
    }
  }

  return spans.sort((left, right) => left.start - right.start);
}

function scanChapterRecords(text: string) {
  const records: UnknownRecord[] = [];

  for (const span of findObjectSpans(text)) {
    const candidate = parseJsonText(text.slice(span.start, span.end + 1));

    if (isRecord(candidate) && isChapterCandidate(candidate)) {
      records.push(candidate);
    }
  }

  return records;
}

export function parseOutlineResponse(
  text: string,
  startChapter: number,
  expectedCount: number,
): ParsedOutlineBatch {
  const expectedChapterNumbers = Array.from(
    { length: Math.max(0, expectedCount) },
    (_, index) => startChapter + index,
  );
  const expectedNumberSet = new Set(expectedChapterNumbers);
  const payload = parseJsonPayload(text);
  const parsedSource = findChapterRecords(payload);
  const rawRecords =
    parsedSource && parsedSource.records.length > 0
      ? parsedSource.records
      : scanChapterRecords(text);
  const trustedRecords = Boolean(
    parsedSource && parsedSource.records.length > 0,
  );
  const usedNumbers = new Set<number>();
  const chapters: StoryOutlineChapter[] = [];
  let nextExpectedIndex = 0;

  for (const rawRecord of rawRecords) {
    if (
      !isRecord(rawRecord) ||
      (!trustedRecords && !isChapterCandidate(rawRecord))
    ) {
      continue;
    }

    const parsed = parseChapter(rawRecord);

    if (!parsed) {
      continue;
    }

    let chapterNumber =
      parsed.explicitNumber &&
      expectedNumberSet.has(parsed.explicitNumber) &&
      !usedNumbers.has(parsed.explicitNumber)
        ? parsed.explicitNumber
        : null;

    if (chapterNumber === null) {
      while (
        nextExpectedIndex < expectedChapterNumbers.length &&
        usedNumbers.has(expectedChapterNumbers[nextExpectedIndex])
      ) {
        nextExpectedIndex += 1;
      }

      chapterNumber =
        expectedChapterNumbers[nextExpectedIndex] ?? null;
    }

    if (chapterNumber === null || usedNumbers.has(chapterNumber)) {
      continue;
    }

    usedNumbers.add(chapterNumber);
    chapters.push({
      chapterNumber,
      ...parsed.content,
    });
  }

  chapters.sort(
    (left, right) => left.chapterNumber - right.chapterNumber,
  );

  return {
    chapters,
    expectedChapterNumbers,
    missingChapterNumbers: expectedChapterNumbers.filter(
      (chapterNumber) => !usedNumbers.has(chapterNumber),
    ),
  };
}
