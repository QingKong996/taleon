import type { KnownApi } from '@earendil-works/pi-ai';

import { normalizeBaseUrl } from '@/lib/provider/api';

const OPENAI_MODEL_LIST_APIS = new Set<KnownApi>([
  'openai-completions',
  'openai-responses',
]);

type FetchOpenAiModelsOptions = {
  api: string;
  apiKey: string;
  baseUrl: string;
  fetch?: typeof fetch;
  signal?: AbortSignal;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getModelListUrl(baseUrl: string) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  if (!normalizedBaseUrl) {
    throw new Error('请先填写 Base URL');
  }

  const url = new URL(normalizedBaseUrl);
  const pathname = url.pathname.replace(/\/+$/, '');

  url.pathname = pathname.endsWith('/models')
    ? pathname
    : `${pathname}/models`;
  url.hash = '';
  url.search = '';

  return url.toString();
}

function readResponseModels(payload: unknown) {
  const items = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.data)
      ? payload.data
      : [];
  const modelIds: string[] = [];
  const seenModelIds = new Set<string>();

  for (const item of items) {
    const modelId =
      typeof item === 'string'
        ? item.trim()
        : isRecord(item) && typeof item.id === 'string'
          ? item.id.trim()
          : '';

    if (modelId && !seenModelIds.has(modelId)) {
      modelIds.push(modelId);
      seenModelIds.add(modelId);
    }
  }

  return modelIds;
}

async function readErrorMessage(response: Response) {
  try {
    const payload: unknown = await response.json();

    if (isRecord(payload)) {
      if (isRecord(payload.error) && typeof payload.error.message === 'string') {
        return payload.error.message;
      }

      if (typeof payload.message === 'string') {
        return payload.message;
      }
    }
  } catch {
    // Fall back to the HTTP status when the response is not JSON.
  }

  return `获取模型失败 (${response.status})`;
}

export function supportsOpenAiModelList(api: string) {
  return OPENAI_MODEL_LIST_APIS.has(api as KnownApi);
}

export async function fetchOpenAiModels({
  api,
  apiKey,
  baseUrl,
  fetch: fetchImpl = fetch,
  signal,
}: FetchOpenAiModelsOptions) {
  if (!supportsOpenAiModelList(api)) {
    throw new Error('当前 API 协议不支持获取模型列表');
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  const trimmedApiKey = apiKey.trim();

  if (trimmedApiKey) {
    headers.Authorization = `Bearer ${trimmedApiKey}`;
  }

  const response = await fetchImpl(getModelListUrl(baseUrl), {
    headers,
    signal,
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const modelIds = readResponseModels(await response.json());

  if (modelIds.length === 0) {
    throw new Error('未获取到模型');
  }

  return modelIds;
}
