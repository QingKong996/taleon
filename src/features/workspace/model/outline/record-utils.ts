export type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function readOptionalString(
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

export function readString(
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
