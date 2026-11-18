import { findAvailableAssistantProvider } from '@/lib/assistant/provider';
import type { ProviderConfig } from '@/lib/provider/config';

function createConfig(
  id: string,
  modelIds: readonly string[],
): ProviderConfig {
  return {
    api: 'openai-completions',
    id,
    models: modelIds.map((modelId) => ({ id: modelId })),
    name: id,
    providerId: id,
  };
}

describe('findAvailableAssistantProvider', () => {
  test('returns the first configured model with a non-empty API key', async () => {
    const withoutModels = createConfig('without-models', []);
    const selectedConfig = createConfig('selected', ['   ', '  gpt-4o  ']);
    const laterConfig = createConfig('later', ['claude']);
    const getProviderApiKey = jest
      .fn()
      .mockResolvedValue('  sk-test  ');

    await expect(
      findAvailableAssistantProvider(
        [withoutModels, selectedConfig, laterConfig],
        getProviderApiKey,
      ),
    ).resolves.toEqual({
      apiKey: 'sk-test',
      config: selectedConfig,
      modelId: 'gpt-4o',
    });

    expect(getProviderApiKey).toHaveBeenCalledTimes(1);
    expect(getProviderApiKey).toHaveBeenCalledWith('selected');
  });

  test('skips providers whose API key is missing or blank', async () => {
    const firstConfig = createConfig('first', ['gpt-4']);
    const secondConfig = createConfig('second', ['claude']);
    const getProviderApiKey = jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('   ')
      .mockResolvedValueOnce('key-3');

    await expect(
      findAvailableAssistantProvider(
        [
          firstConfig,
          secondConfig,
          createConfig('third', ['model-3']),
        ],
        getProviderApiKey,
      ),
    ).resolves.toMatchObject({
      apiKey: 'key-3',
      config: { id: 'third' },
      modelId: 'model-3',
    });
    expect(getProviderApiKey).toHaveBeenCalledTimes(3);
  });

  test('reports missing API keys when models are configured', async () => {
    await expect(
      findAvailableAssistantProvider(
        [createConfig('configured', ['gpt-4'])],
        jest.fn().mockResolvedValue(null),
      ),
    ).rejects.toThrow('请先为供应商配置 API Key');
  });

  test('reports missing providers and models', async () => {
    const getProviderApiKey = jest.fn();

    await expect(
      findAvailableAssistantProvider(
        [createConfig('empty', ['   '])],
        getProviderApiKey,
      ),
    ).rejects.toThrow('请先在设置中添加供应商和模型');
    expect(getProviderApiKey).not.toHaveBeenCalled();
  });
});
