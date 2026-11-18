import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import {
  parseStoredProviderConfigs,
  type ProviderConfig,
} from '@/lib/provider/config';

const CONFIGS_STORAGE_KEY = 'taleon.provider-configs';
const API_KEY_STORAGE_PREFIX = 'taleon.provider.key.';

function getApiKeyStorageKey(configId: string) {
  return `${API_KEY_STORAGE_PREFIX}${configId.replace(
    /[^A-Za-z0-9._-]/g,
    '_',
  )}`;
}

export async function readStoredProviderConfigs() {
  try {
    const storedValue = await AsyncStorage.getItem(CONFIGS_STORAGE_KEY);

    return parseStoredProviderConfigs(storedValue);
  } catch {
    return [];
  }
}

export function writeStoredProviderConfigs(configs: readonly ProviderConfig[]) {
  return AsyncStorage.setItem(CONFIGS_STORAGE_KEY, JSON.stringify(configs));
}

export function readStoredProviderApiKey(configId: string) {
  return SecureStore.getItemAsync(getApiKeyStorageKey(configId));
}

export async function writeStoredProviderApiKey(
  configId: string,
  apiKey: string,
) {
  const storageKey = getApiKeyStorageKey(configId);
  const normalizedApiKey = apiKey.trim();

  if (normalizedApiKey) {
    await SecureStore.setItemAsync(storageKey, normalizedApiKey);
    return;
  }

  await SecureStore.deleteItemAsync(storageKey);
}

export function removeStoredProviderApiKey(configId: string) {
  return SecureStore.deleteItemAsync(getApiKeyStorageKey(configId));
}
