import type { KnownApi } from '@earendil-works/pi-ai';

import { isKnownProviderApi } from '@/lib/provider/api';

export type ProviderConfig = {
  api: KnownApi;
  baseUrl?: string;
  custom?: boolean;
  id: string;
  models?: ProviderModel[];
  name: string;
  providerId: string;
};

export type ProviderModel = {
  contextWindow?: number;
  id: string;
  maxTokens?: number;
};

export type SaveProviderConfigInput = Omit<ProviderConfig, 'id'> & {
  id?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readPositiveInteger(value: unknown) {
  return typeof value === 'number' &&
    Number.isInteger(value) &&
    value > 0
    ? value
    : undefined;
}

function parseProviderModels(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const models: ProviderModel[] = [];
  const seenModelIds = new Set<string>();

  for (const item of value) {
    const modelId =
      typeof item === 'string'
        ? item.trim()
        : isRecord(item) && typeof item.id === 'string'
          ? item.id.trim()
          : '';

    if (!modelId || seenModelIds.has(modelId)) {
      continue;
    }

    models.push({
      contextWindow: isRecord(item)
        ? readPositiveInteger(item.contextWindow)
        : undefined,
      id: modelId,
      maxTokens: isRecord(item)
        ? readPositiveInteger(item.maxTokens)
        : undefined,
    });
    seenModelIds.add(modelId);
  }

  return models.length > 0 ? models : undefined;
}

function parseProviderConfig(value: unknown): ProviderConfig | null {
  if (!isRecord(value)) {
    return null;
  }

  const { api, baseUrl, id, name, providerId } = value;

  if (
    typeof api !== 'string' ||
    typeof id !== 'string' ||
    typeof name !== 'string' ||
    typeof providerId !== 'string'
  ) {
    return null;
  }

  const normalizedApi = api.trim();
  const normalizedId = id.trim();
  const normalizedName = name.trim();
  const normalizedProviderId = providerId.trim();

  if (
    !isKnownProviderApi(normalizedApi) ||
    !normalizedId ||
    !normalizedName ||
    !normalizedProviderId
  ) {
    return null;
  }

  return {
    api: normalizedApi,
    baseUrl:
      typeof baseUrl === 'string' && baseUrl.trim()
        ? baseUrl.trim()
        : undefined,
    custom: value.custom === true ? true : undefined,
    id: normalizedId,
    models: parseProviderModels(value.models),
    name: normalizedName,
    providerId: normalizedProviderId,
  };
}

export function parseStoredProviderConfigs(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    const configs: ProviderConfig[] = [];
    const configIds = new Set<string>();
    const providerIds = new Set<string>();

    for (const item of parsed) {
      const config = parseProviderConfig(item);

      if (
        config &&
        !configIds.has(config.id) &&
        !providerIds.has(config.providerId)
      ) {
        configs.push(config);
        configIds.add(config.id);
        providerIds.add(config.providerId);
      }
    }

    return configs;
  } catch {
    return [];
  }
}

function createProviderConfigId() {
  return `provider_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export function normalizeProviderConfig(
  input: SaveProviderConfigInput,
): ProviderConfig {
  const id = input.id?.trim() || createProviderConfigId();
  const name = input.name.trim();
  const providerId = input.providerId.trim();

  if (!isKnownProviderApi(input.api)) {
    throw new Error('请选择 API 协议');
  }

  if (!name) {
    throw new Error('请输入供应商名称');
  }

  if (!providerId) {
    throw new Error('请输入供应商 ID');
  }

  return {
    api: input.api,
    baseUrl: input.baseUrl?.trim() || undefined,
    custom: input.custom ? true : undefined,
    id,
    models: parseProviderModels(input.models),
    name,
    providerId,
  };
}
