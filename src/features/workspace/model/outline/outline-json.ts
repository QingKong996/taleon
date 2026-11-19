import {
  isRecord,
  type UnknownRecord,
} from '@/features/workspace/model/outline/record-utils';

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

export function parseJsonPayload(text: string) {
  for (const candidate of createJsonCandidates(text)) {
    const parsed = parseJsonText(candidate);

    if (parsed !== undefined) {
      return parsed;
    }
  }

  return undefined;
}

function findObjectSpans(text: string) {
  const spans: { start: number; end: number }[] = [];
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

export function scanRecords(
  text: string,
  isCandidate: (record: UnknownRecord) => boolean,
) {
  const records: UnknownRecord[] = [];

  for (const span of findObjectSpans(text)) {
    const candidate = parseJsonText(text.slice(span.start, span.end + 1));

    if (isRecord(candidate) && isCandidate(candidate)) {
      records.push(candidate);
    }
  }

  return records;
}
