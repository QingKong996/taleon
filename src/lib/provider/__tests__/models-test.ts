import {
  fetchOpenAiModels,
  supportsOpenAiModelList,
} from '@/lib/provider/models';

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

describe('supportsOpenAiModelList', () => {
  test('supports only OpenAI-compatible model list APIs', () => {
    expect(supportsOpenAiModelList('openai-completions')).toBe(true);
    expect(supportsOpenAiModelList('openai-responses')).toBe(true);
    expect(supportsOpenAiModelList('anthropic-messages')).toBe(false);
    expect(supportsOpenAiModelList('openai-completions ')).toBe(false);
  });
});

describe('fetchOpenAiModels', () => {
  test('requests the model list and normalizes response ids', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      createResponse({
        data: [
          { id: ' gpt-4 ' },
          { id: 'gpt-4' },
          'gpt-4o',
          { id: '' },
          { id: 42 },
          null,
        ],
      }),
    ) as jest.MockedFunction<typeof fetch>;
    const signal = new AbortController().signal;

    await expect(
      fetchOpenAiModels({
        api: 'openai-completions',
        apiKey: '  sk-test  ',
        baseUrl: ' https://api.example.com/v1/ ',
        fetch: fetchMock,
        signal,
      }),
    ).resolves.toEqual(['gpt-4', 'gpt-4o']);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/v1/models',
      {
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer sk-test',
        },
        signal,
      },
    );
  });

  test('omits authorization when the API key is blank', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      createResponse([{ id: 'model-a' }]),
    ) as jest.MockedFunction<typeof fetch>;

    await expect(
      fetchOpenAiModels({
        api: 'openai-responses',
        apiKey: '   ',
        baseUrl: 'https://api.example.com/v1/models/?ignored=1#hash',
        fetch: fetchMock,
      }),
    ).resolves.toEqual(['model-a']);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/v1/models',
      {
        headers: { Accept: 'application/json' },
        signal: undefined,
      },
    );
  });

  test('rejects unsupported APIs before fetching', async () => {
    const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;

    await expect(
      fetchOpenAiModels({
        api: 'anthropic-messages',
        apiKey: 'key',
        baseUrl: 'https://api.example.com',
        fetch: fetchMock,
      }),
    ).rejects.toThrow('当前 API 协议不支持获取模型列表');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('requires a base URL', async () => {
    const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;

    await expect(
      fetchOpenAiModels({
        api: 'openai-completions',
        apiKey: 'key',
        baseUrl: '   ',
        fetch: fetchMock,
      }),
    ).rejects.toThrow('请先填写 Base URL');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test.each([
    [
      { error: { message: 'Invalid API key' } },
      401,
      'Invalid API key',
    ],
    [{ message: 'Rate limited' }, 429, 'Rate limited'],
    [{ error: 'unexpected' }, 500, '获取模型失败 (500)'],
  ])('surfaces API errors', async (body, status, expectedMessage) => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(
        createResponse(body, { ok: false, status }),
      ) as jest.MockedFunction<typeof fetch>;

    await expect(
      fetchOpenAiModels({
        api: 'openai-completions',
        apiKey: 'key',
        baseUrl: 'https://api.example.com/v1',
        fetch: fetchMock,
      }),
    ).rejects.toThrow(expectedMessage);
  });

  test('falls back to the status when the error response is not JSON', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: jest.fn().mockRejectedValue(new Error('invalid json')),
    } as unknown as Response) as jest.MockedFunction<typeof fetch>;

    await expect(
      fetchOpenAiModels({
        api: 'openai-completions',
        apiKey: 'key',
        baseUrl: 'https://api.example.com/v1',
        fetch: fetchMock,
      }),
    ).rejects.toThrow('获取模型失败 (502)');
  });

  test('rejects empty model lists', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(
        createResponse({ data: [] }),
      ) as jest.MockedFunction<typeof fetch>;

    await expect(
      fetchOpenAiModels({
        api: 'openai-completions',
        apiKey: 'key',
        baseUrl: 'https://api.example.com/v1',
        fetch: fetchMock,
      }),
    ).rejects.toThrow('未获取到模型');
  });
});
