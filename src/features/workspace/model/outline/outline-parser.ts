import {
  findChapterRecords,
  findSectionRecords,
  isChapterCandidate,
  isSectionCandidate,
  parseChapter,
  parseSections,
} from '@/features/workspace/model/outline/outline-entry-parser';
import {
  parseJsonPayload,
  scanRecords,
} from '@/features/workspace/model/outline/outline-json';
import { isRecord } from '@/features/workspace/model/outline/record-utils';
import type {
  StoryOutlineChapter,
  StoryOutlineSection,
} from '@/features/workspace/model/workbench-data';

export type OutlineGenerationResult = {
  chapters: StoryOutlineChapter[];
  expectedChapterNumbers: number[];
  missingChapterNumbers: number[];
};

export function parseOutlineResponse(
  text: string,
  startChapter: number,
  expectedCount: number,
): OutlineGenerationResult {
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
      : scanRecords(text, isChapterCandidate);
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

export function parseSectionOutlineResponse(
  text: string,
  expectedCount: number,
): StoryOutlineSection[] {
  const count = Math.max(0, Math.floor(expectedCount));

  if (!count) {
    return [];
  }

  const sections = findSectionRecords(parseJsonPayload(text));
  const records = sections ?? scanRecords(text, isSectionCandidate);

  return parseSections(records).slice(0, count);
}
