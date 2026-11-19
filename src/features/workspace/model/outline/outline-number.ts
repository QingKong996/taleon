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

export function parseLeadingChapterNumber(value: string) {
  const normalized = value.normalize('NFKC').trim();
  const match = normalized.match(
    /^第\s*([0-9一二三四五六七八九十百千万两零〇]+)\s*章/,
  );

  return match ? parseChineseNumber(match[1]) : null;
}

export function parseChapterNumber(value: string) {
  const normalized = value.normalize('NFKC').trim();

  if (/^\d+$/.test(normalized)) {
    return Number(normalized);
  }

  return (
    parseLeadingChapterNumber(normalized) ??
    parseChineseNumber(normalized)
  );
}

export function readChapterNumberValue(value: unknown) {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0 ? value : null;
  }

  if (typeof value === 'string') {
    return parseChapterNumber(value);
  }

  return null;
}
