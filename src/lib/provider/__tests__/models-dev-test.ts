function createResponse(
  body: unknown,
  options: { ok?: boolean; status?: number } = {},
) {
  const { ok = true, status = 200 } = options;

  return {
    ok,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe('models.dev catalog', () => {
  let modelsDev: typeof import('@/lib/provider/models-dev');

  beforeEach(() => {
    jest.resetModules();
    jest.isolateModules(() => {
      modelsDev = jest.requireActual<
        typeof import('@/lib/provider/models-dev')
      >('@/lib/provider/models-dev');
    });
  });

  test('parses, filters, and sorts catalog entries', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      createResponse({
        zeta: {
          name: ' Zeta ',
          models: {
            'model-b': { id: 'model-b', limit: { context: 1000 } },
            'model-a': { reasoning: true },
            invalid: 'skip',
          },
          env: ['ZETA_KEY', 42],
        },
        alpha: {
          id: 'alpha-id',
          name: 'Alpha',
          npm: '@ai-sdk/openai',
          models: {
            'model-z': { id: 'model-z' },
          },
        },
        ignored: { name: 'Ignored' },
        nullProvider: null,
      }),
    ) as jest.MockedFunction<typeof fetch>;

    const catalog = await modelsDev.fetchModelsDevCatalog({
      fetch: fetchMock,
    });

    expect(catalog.map((provider) => provider.name)).toEqual([
      'Alpha',
      'Zeta',
    ]);
    expect(catalog[0]).toMatchObject({
      id: 'alpha-id',
      npm: '@ai-sdk/openai',
    });
    expect(catalog[1]).toMatchObject({
      env: ['ZETA_KEY'],
      id: 'zeta',
      name: 'Zeta',
    });
    expect(catalog[1].models['model-a'].id).toBe('model-a');
    expect(catalog[1].models.invalid).toBeUndefined();
    expect(
      modelsDev
        .getModelsDevModels(catalog[1])
        .map((model) => model.id),
    ).toEqual(['model-a', 'model-b']);
  });

  test('fetches the catalog once and reuses the cache', async () => {
    const payload = {
      provider: {
        name: 'Provider',
        models: { model: { id: 'model' } },
      },
    };
    const fetchMock = jest
      .fn()
      .mockResolvedValue(
        createResponse(payload),
      ) as jest.MockedFunction<typeof fetch>;
    const signal = new AbortController().signal;

    const first = await modelsDev.fetchModelsDevCatalog({
      fetch: fetchMock,
      signal,
    });
    const second = await modelsDev.fetchModelsDevCatalog({
      fetch: fetchMock,
    });

    expect(second).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://models.dev/api.json',
      {
        headers: { Accept: 'application/json' },
        signal,
      },
    );
  });

  test('rejects non-success responses', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(
        createResponse({}, { ok: false, status: 503 }),
      ) as jest.MockedFunction<typeof fetch>;

    await expect(
      modelsDev.fetchModelsDevCatalog({ fetch: fetchMock }),
    ).rejects.toThrow(
      'models.dev request failed with status 503',
    );
  });

  test('rejects invalid catalog payloads', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(
        createResponse([]),
      ) as jest.MockedFunction<typeof fetch>;

    await expect(
      modelsDev.fetchModelsDevCatalog({ fetch: fetchMock }),
    ).rejects.toThrow('models.dev returned an invalid catalog');
  });
});
