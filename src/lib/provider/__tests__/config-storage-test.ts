import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import {
  readStoredProviderApiKey,
  readStoredProviderConfigs,
  removeStoredProviderApiKey,
  writeStoredProviderApiKey,
  writeStoredProviderConfigs,
} from '@/lib/provider/config-storage';
import type { ProviderConfig } from '@/lib/provider/config';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

jest.mock('expo-secure-store', () => ({
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

const config: ProviderConfig = {
  api: 'openai-completions',
  id: 'config-1',
  name: 'OpenAI',
  providerId: 'openai',
};

describe('provider config storage', () => {
  test('reads and parses stored configs', async () => {
    jest.mocked(AsyncStorage.getItem).mockResolvedValue(
      JSON.stringify([config]),
    );

    await expect(readStoredProviderConfigs()).resolves.toEqual([
      config,
    ]);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(
      'taleon.provider-configs',
    );
  });

  test('returns an empty list when config storage fails', async () => {
    jest
      .mocked(AsyncStorage.getItem)
      .mockRejectedValue(new Error('storage unavailable'));

    await expect(readStoredProviderConfigs()).resolves.toEqual([]);
  });

  test('writes configs as JSON', async () => {
    jest.mocked(AsyncStorage.setItem).mockResolvedValue();

    await writeStoredProviderConfigs([config]);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'taleon.provider-configs',
      JSON.stringify([config]),
    );
  });

  test('sanitizes provider ids in API key storage keys', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue('key');

    await readStoredProviderApiKey('config / one#');

    expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
      'taleon.provider.key.config___one_',
    );
  });

  test('trims and stores non-empty API keys', async () => {
    jest.mocked(SecureStore.setItemAsync).mockResolvedValue();

    await writeStoredProviderApiKey('config-1', '  sk-test  ');

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'taleon.provider.key.config-1',
      'sk-test',
    );
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  test('deletes API keys when writing an empty value', async () => {
    jest.mocked(SecureStore.deleteItemAsync).mockResolvedValue();

    await writeStoredProviderApiKey('config-1', '   ');

    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      'taleon.provider.key.config-1',
    );
  });

  test('removes API keys by sanitized config id', async () => {
    jest.mocked(SecureStore.deleteItemAsync).mockResolvedValue();

    await removeStoredProviderApiKey('config/2');

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      'taleon.provider.key.config_2',
    );
  });
});
