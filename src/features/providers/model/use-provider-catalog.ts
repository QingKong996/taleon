import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  fetchModelsDevCatalog,
  type ModelsDevProvider,
} from '@/lib/provider/models-dev';
import { getProviderBaseUrl } from '@/lib/provider/api';
import type { ProviderConfig } from '@/lib/provider/config';
import { useProviderSettings } from '@/providers/provider-settings';

type CatalogStatus = 'error' | 'loading' | 'ready';

export type ProviderCatalogItem = {
  baseUrl?: string;
  name: string;
  npm?: string;
  providerId: string;
};

export type SavedProviderItem = {
  configId: string;
  name: string;
  providerId: string;
};

function createSavedItem(config: ProviderConfig): SavedProviderItem {
  return {
    configId: config.id,
    name: config.name,
    providerId: config.providerId,
  };
}

export function useProviderCatalog() {
  const { configs, isReady } = useProviderSettings();
  const [providers, setProviders] = useState<ModelsDevProvider[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [status, setStatus] = useState<CatalogStatus>('loading');

  useEffect(() => {
    const controller = new AbortController();

    fetchModelsDevCatalog({ signal: controller.signal })
      .then((catalog) => {
        if (!controller.signal.aborted) {
          setProviders(catalog);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setStatus('error');
        }
      });

    return () => {
      controller.abort();
    };
  }, [reloadKey]);

  const providerItems = useMemo<ProviderCatalogItem[]>(
    () =>
      providers.map((provider) => ({
        baseUrl: getProviderBaseUrl(provider),
        name: provider.name,
        npm: provider.npm,
        providerId: provider.id,
      })),
    [providers],
  );

  const savedItems = useMemo(
    () => configs.map(createSavedItem),
    [configs],
  );

  const retry = useCallback(() => {
    setStatus('loading');
    setReloadKey((currentKey) => currentKey + 1);
  }, []);

  return {
    configs,
    isReady,
    providerItems,
    retry,
    savedItems,
    status,
  };
}
