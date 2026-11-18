import {
  getDefaultProviderApi,
  getProviderBaseUrl,
  isKnownProviderApi,
  normalizeBaseUrl,
  PROVIDER_API_OPTIONS,
} from '@/lib/provider/api';

describe('provider API helpers', () => {
  test('recognizes every configured API option', () => {
    for (const option of PROVIDER_API_OPTIONS) {
      expect(isKnownProviderApi(option.value)).toBe(true);
    }

    expect(isKnownProviderApi('unknown-api')).toBe(false);
    expect(isKnownProviderApi('OPENAI-COMPLETIONS')).toBe(false);
  });

  test('resolves provider defaults by provider id and npm package', () => {
    expect(getDefaultProviderApi('OpenAI')).toBe('openai-responses');
    expect(getDefaultProviderApi('google')).toBe('google-generative-ai');
    expect(getDefaultProviderApi('unknown', '@ai-sdk/azure')).toBe(
      'azure-openai-responses',
    );
    expect(getDefaultProviderApi('unknown', 'unknown-package')).toBe(
      'openai-completions',
    );
  });

  test('resolves provider base URLs', () => {
    expect(
      getProviderBaseUrl({ api: '  https://custom.example.com/v1  ' }),
    ).toBe('https://custom.example.com/v1');
    expect(getProviderBaseUrl({ id: 'DeepSeek' })).toBe(
      'https://api.deepseek.com',
    );
    expect(getProviderBaseUrl({ id: 'unknown' })).toBeUndefined();
    expect(getProviderBaseUrl()).toBeUndefined();
  });

  test('normalizes HTTP and HTTPS base URLs', () => {
    expect(normalizeBaseUrl('  https://api.example.com/v1  ')).toBe(
      'https://api.example.com/v1',
    );
    expect(normalizeBaseUrl('http://localhost:3000')).toBe(
      'http://localhost:3000',
    );
    expect(normalizeBaseUrl('   ')).toBeUndefined();
  });

  test('rejects malformed and unsupported base URLs', () => {
    expect(() => normalizeBaseUrl('not a url')).toThrow(
      'Base URL 格式无效',
    );
    expect(() => normalizeBaseUrl('ftp://example.com')).toThrow(
      'Base URL 仅支持 HTTP 或 HTTPS',
    );
  });
});
