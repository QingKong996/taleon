const MODELS_DEV_API_URL = 'https://models.dev/api.json';
let catalogCache: ModelsDevProvider[] | undefined;

export type ModelsDevModel = {
  id: string;
  attachment?: boolean;
  canonical_model_id?: string;
  cost?: {
    cache_read?: number;
    cache_write?: number;
    input?: number;
    output?: number;
  };
  description?: string;
  family?: string;
  knowledge?: string;
  last_updated?: string;
  limit?: {
    context?: number;
    output?: number;
  };
  modalities?: {
    input?: readonly string[];
    output?: readonly string[];
  };
  open_weights?: boolean;
  reasoning?: boolean;
  release_date?: string;
  structured_output?: boolean;
  temperature?: boolean;
  tool_call?: boolean;
};

export type ModelsDevProvider = {
  api?: string;
  doc?: string;
  env?: readonly string[];
  id: string;
  models: Record<string, ModelsDevModel>;
  name: string;
  npm?: string;
};

type FetchModelsDevCatalogOptions = {
  fetch?: typeof fetch;
  signal?: AbortSignal;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function parseModels(rawModels: Record<string, unknown>) {
  const models: Record<string, ModelsDevModel> = {};

  for (const [modelKey, rawModel] of Object.entries(rawModels)) {
    if (!isRecord(rawModel)) {
      continue;
    }

    models[modelKey] = {
      ...rawModel,
      id: readString(rawModel.id) ?? modelKey,
    } as ModelsDevModel;
  }

  return models;
}

function parseCatalog(payload: unknown): ModelsDevProvider[] {
  if (!isRecord(payload)) {
    throw new Error('models.dev returned an invalid catalog');
  }

  const providers: ModelsDevProvider[] = [];

  for (const [providerKey, rawProvider] of Object.entries(payload)) {
    if (!isRecord(rawProvider) || !isRecord(rawProvider.models)) {
      continue;
    }

    const name = readString(rawProvider.name)?.trim() || providerKey;

    providers.push({
      api: readString(rawProvider.api),
      doc: readString(rawProvider.doc),
      env: Array.isArray(rawProvider.env)
        ? rawProvider.env.filter((value): value is string => typeof value === 'string')
        : undefined,
      id: readString(rawProvider.id) ?? providerKey,
      models: parseModels(rawProvider.models),
      name,
      npm: readString(rawProvider.npm),
    });
  }

  return sortModelsDevProviders(providers);
}

function sortModelsDevProviders(providers: readonly ModelsDevProvider[]) {
  return [...providers].sort((left, right) => left.name.localeCompare(right.name, 'en'));
}

export function getModelsDevModels(provider: ModelsDevProvider) {
  return Object.values(provider.models).sort((left, right) =>
    left.id.localeCompare(right.id, 'en'),
  );
}

export async function fetchModelsDevCatalog({
  fetch: fetchImpl = fetch,
  signal,
}: FetchModelsDevCatalogOptions = {}): Promise<ModelsDevProvider[]> {
  if (catalogCache) {
    return catalogCache;
  }

  const response = await fetchImpl(MODELS_DEV_API_URL, {
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`models.dev request failed with status ${response.status}`);
  }

  catalogCache = parseCatalog(await response.json());

  return catalogCache;
}
