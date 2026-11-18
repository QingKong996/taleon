import type { ProviderConfig } from '@/lib/provider-config';

export type AvailableAssistantProvider = {
  apiKey: string;
  config: ProviderConfig;
  modelId: string;
};

export async function findAvailableAssistantProvider(
  configs: readonly ProviderConfig[],
  getProviderApiKey: (configId: string) => Promise<string | null>,
): Promise<AvailableAssistantProvider> {
  let hasConfiguredModel = false;

  for (const config of configs) {
    const modelId = config.models?.find((model) => model.id.trim())?.id.trim();

    if (!modelId) {
      continue;
    }

    hasConfiguredModel = true;
    const apiKey = (await getProviderApiKey(config.id))?.trim();

    if (apiKey) {
      return { apiKey, config, modelId };
    }
  }

  throw new Error(
    hasConfiguredModel
      ? '请先为供应商配置 API Key'
      : '请先在设置中添加供应商和模型',
  );
}
