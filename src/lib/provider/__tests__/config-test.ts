import {
  normalizeProviderConfig,
  parseStoredProviderConfigs,
} from '@/lib/provider/config';

describe('parseStoredProviderConfigs', () => {
  test.each([null, '', 'not json', '{}', '"text"'])(
    'returns an empty list for %p',
    (value) => {
      expect(parseStoredProviderConfigs(value)).toEqual([]);
    },
  );

  test('normalizes valid configs and deduplicates models', () => {
    const configs = parseStoredProviderConfigs(
      JSON.stringify([
        {
          api: ' openai-completions ',
          baseUrl: ' https://api.example.com/v1 ',
          custom: true,
          id: ' config-1 ',
          models: [
            {
              id: 'gpt-4',
              contextWindow: 128000,
              maxTokens: 8192,
            },
            ' gpt-4 ',
            {
              id: 'gpt-4o',
              contextWindow: 0,
              maxTokens: 1.5,
            },
            { id: '' },
            { id: 42 },
            null,
          ],
          name: ' Example ',
          providerId: ' example ',
        },
      ]),
    );

    expect(configs).toEqual([
      {
        api: 'openai-completions',
        baseUrl: 'https://api.example.com/v1',
        custom: true,
        id: 'config-1',
        models: [
          {
            contextWindow: 128000,
            id: 'gpt-4',
            maxTokens: 8192,
          },
          {
            contextWindow: undefined,
            id: 'gpt-4o',
            maxTokens: undefined,
          },
        ],
        name: 'Example',
        providerId: 'example',
      },
    ]);
  });

  test('skips duplicate ids, duplicate provider ids, and invalid configs', () => {
    const baseConfig = {
      api: 'openai-completions',
      id: 'config-1',
      name: 'OpenAI',
      providerId: 'openai',
    };
    const configs = parseStoredProviderConfigs(
      JSON.stringify([
        baseConfig,
        { ...baseConfig, providerId: 'anthropic' },
        { ...baseConfig, id: 'config-2' },
        {
          ...baseConfig,
          api: 'unknown-api',
          id: 'config-3',
          providerId: 'google',
        },
        {
          ...baseConfig,
          id: 'config-4',
          name: '   ',
          providerId: 'deepseek',
        },
        {
          ...baseConfig,
          api: 'anthropic-messages',
          id: 'config-5',
          providerId: 'anthropic',
        },
      ]),
    );

    expect(configs.map((config) => config.id)).toEqual([
      'config-1',
      'config-5',
    ]);
  });

  test('only preserves explicit truthy custom flags and non-empty models', () => {
    const configs = parseStoredProviderConfigs(
      JSON.stringify([
        {
          api: 'openai-responses',
          baseUrl: '   ',
          custom: 'true',
          id: 'config-1',
          models: [],
          name: 'OpenAI',
          providerId: 'openai',
        },
      ]),
    );

    expect(configs).toEqual([
      {
        api: 'openai-responses',
        baseUrl: undefined,
        custom: undefined,
        id: 'config-1',
        models: undefined,
        name: 'OpenAI',
        providerId: 'openai',
      },
    ]);
  });
});

describe('normalizeProviderConfig', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('trims persisted fields and model metadata', () => {
    expect(
      normalizeProviderConfig({
        api: 'anthropic-messages',
        baseUrl: '  https://api.anthropic.com  ',
        custom: true,
        id: '  config-1  ',
        models: [{ id: '  claude-sonnet  ', contextWindow: 200000 }],
        name: '  Anthropic  ',
        providerId: '  anthropic  ',
      }),
    ).toEqual({
      api: 'anthropic-messages',
      baseUrl: 'https://api.anthropic.com',
      custom: true,
      id: 'config-1',
      models: [
        {
          contextWindow: 200000,
          id: 'claude-sonnet',
          maxTokens: undefined,
        },
      ],
      name: 'Anthropic',
      providerId: 'anthropic',
    });
  });

  test('generates an id when none is provided', () => {
    jest.spyOn(Date, 'now').mockReturnValue(123456789);
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    const config = normalizeProviderConfig({
      api: 'openai-completions',
      name: 'OpenAI',
      providerId: 'openai',
    });

    expect(config.id).toMatch(/^provider_[0-9a-z]+_[0-9a-z]+$/);
  });

  test.each([
    [
      {
        api: 'unknown-api',
        name: 'OpenAI',
        providerId: 'openai',
      },
      '请选择 API 协议',
    ],
    [
      {
        api: 'openai-completions',
        name: '   ',
        providerId: 'openai',
      },
      '请输入供应商名称',
    ],
    [
      {
        api: 'openai-completions',
        name: 'OpenAI',
        providerId: '   ',
      },
      '请输入供应商 ID',
    ],
  ])('rejects invalid config input', (input, errorMessage) => {
    expect(() =>
      normalizeProviderConfig(input as Parameters<
        typeof normalizeProviderConfig
      >[0]),
    ).toThrow(errorMessage);
  });
});
