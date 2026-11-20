import type { KnownApi } from '@earendil-works/pi-ai';
import { z } from 'zod';

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

const optionalTrimmedString = z
  .unknown()
  .optional()
  .transform((value) =>
    typeof value === 'string' && value.trim() ? value.trim() : undefined,
  );

const optionalCustom = z
  .unknown()
  .optional()
  .transform((value) => (value === true ? true : undefined));

const knownApiSchema = z
  .string()
  .trim()
  .refine(isKnownProviderApi, '请选择 API 协议');

const providerModelInputSchema = z.union([
  z.string().transform((id) => ({
    contextWindow: undefined,
    id,
    maxTokens: undefined,
  })),
  z.object({
    contextWindow: z.number().int().positive().optional().catch(undefined),
    id: z.string(),
    maxTokens: z.number().int().positive().optional().catch(undefined),
  }),
]);

function parseProviderModels(value: unknown) {
  const items = z.array(z.unknown()).safeParse(value);

  if (!items.success) {
    return undefined;
  }

  const models: ProviderModel[] = [];
  const seenModelIds = new Set<string>();

  for (const item of items.data) {
    const parsed = providerModelInputSchema.safeParse(item);

    if (!parsed.success) {
      continue;
    }

    const id = parsed.data.id.trim();

    if (!id || seenModelIds.has(id)) {
      continue;
    }

    models.push({
      contextWindow: parsed.data.contextWindow,
      id,
      maxTokens: parsed.data.maxTokens,
    });
    seenModelIds.add(id);
  }

  return models.length > 0 ? models : undefined;
}

const storedProviderConfigSchema = z
  .object({
    api: knownApiSchema,
    baseUrl: optionalTrimmedString,
    custom: optionalCustom,
    id: z.string().trim().min(1),
    models: z.unknown().optional().transform(parseProviderModels),
    name: z.string().trim().min(1),
    providerId: z.string().trim().min(1),
  })
  .transform((config) => ({
    api: config.api as KnownApi,
    baseUrl: config.baseUrl,
    custom: config.custom,
    id: config.id,
    models: config.models,
    name: config.name,
    providerId: config.providerId,
  }));

const saveProviderConfigSchema = z.object({
  api: knownApiSchema,
  baseUrl: optionalTrimmedString,
  custom: optionalCustom,
  id: optionalTrimmedString,
  models: z.unknown().optional().transform(parseProviderModels),
  name: z.string().trim().min(1, '请输入供应商名称'),
  providerId: z.string().trim().min(1, '请输入供应商 ID'),
});

export function parseStoredProviderConfigs(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    const parsed = z.array(z.unknown()).safeParse(JSON.parse(value));

    if (!parsed.success) {
      return [];
    }

    const configs: ProviderConfig[] = [];
    const configIds = new Set<string>();
    const providerIds = new Set<string>();

    for (const item of parsed.data) {
      const result = storedProviderConfigSchema.safeParse(item);

      if (!result.success) {
        continue;
      }

      const config = result.data;

      if (
        configIds.has(config.id) ||
        providerIds.has(config.providerId)
      ) {
        continue;
      }

      configs.push(config);
      configIds.add(config.id);
      providerIds.add(config.providerId);
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
  const parsed = saveProviderConfigSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? '配置格式无效',
    );
  }

  const config = parsed.data;

  return {
    api: config.api as KnownApi,
    baseUrl: config.baseUrl,
    custom: config.custom,
    id: config.id ?? createProviderConfigId(),
    models: config.models,
    name: config.name,
    providerId: config.providerId,
  };
}
