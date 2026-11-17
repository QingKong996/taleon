import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  normalizeProviderConfig,
  type ProviderConfig,
  type SaveProviderConfigInput,
} from '@/lib/provider-config';
import {
  readStoredProviderApiKey,
  readStoredProviderConfigs,
  removeStoredProviderApiKey,
  writeStoredProviderApiKey,
  writeStoredProviderConfigs,
} from '@/lib/provider-config-storage';

export type {
  ProviderConfig,
  ProviderModel,
  SaveProviderConfigInput,
} from '@/lib/provider-config';

type ProviderSettingsContextValue = {
  configs: readonly ProviderConfig[];
  getProviderApiKey: (configId: string) => Promise<string | null>;
  getProviderConfig: (providerId: string) => ProviderConfig | undefined;
  getProviderConfigById: (configId: string) => ProviderConfig | undefined;
  isReady: boolean;
  removeProviderConfig: (configId: string) => Promise<void>;
  saveProviderConfig: (
    input: SaveProviderConfigInput,
    apiKey?: string,
  ) => Promise<ProviderConfig>;
};

const ProviderSettingsContext = createContext<ProviderSettingsContextValue | null>(
  null,
);

export function ProviderSettingsProvider({ children }: PropsWithChildren) {
  const [configs, setConfigs] = useState<ProviderConfig[]>([]);
  const [isReady, setIsReady] = useState(false);
  const configsRef = useRef<ProviderConfig[]>([]);
  const hasMutated = useRef(false);

  const commitConfigs = useCallback((nextConfigs: ProviderConfig[]) => {
    hasMutated.current = true;
    configsRef.current = nextConfigs;
    setConfigs(nextConfigs);
  }, []);

  useEffect(() => {
    let isMounted = true;

    readStoredProviderConfigs()
      .then((storedConfigs) => {
        if (isMounted && !hasMutated.current) {
          configsRef.current = storedConfigs;
          setConfigs(storedConfigs);
        }
      })
      .catch(() => {
        // Keep the in-memory configuration when local storage is unavailable.
      })
      .finally(() => {
        if (isMounted) {
          setIsReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const configById = useMemo(
    () => new Map(configs.map((config) => [config.id, config] as const)),
    [configs],
  );

  const configByProviderId = useMemo(
    () => new Map(configs.map((config) => [config.providerId, config] as const)),
    [configs],
  );

  const getProviderConfig = useCallback(
    (providerId: string) => configByProviderId.get(providerId),
    [configByProviderId],
  );

  const getProviderConfigById = useCallback(
    (configId: string) => configById.get(configId),
    [configById],
  );

  const getProviderApiKey = useCallback((configId: string) => {
    return readStoredProviderApiKey(configId);
  }, []);

  const saveProviderConfig = useCallback(
    async (input: SaveProviderConfigInput, apiKey?: string) => {
      const config = normalizeProviderConfig(input);
      const duplicateConfig = configsRef.current.find(
        (currentConfig) =>
          currentConfig.providerId === config.providerId &&
          currentConfig.id !== config.id,
      );

      if (duplicateConfig) {
        throw new Error('该供应商已配置');
      }

      if (apiKey !== undefined) {
        await writeStoredProviderApiKey(config.id, apiKey);
      }

      const hasExistingConfig = configsRef.current.some(
        (currentConfig) => currentConfig.id === config.id,
      );
      const nextConfigs = hasExistingConfig
        ? configsRef.current.map((currentConfig) =>
            currentConfig.id === config.id ? config : currentConfig,
          )
        : [...configsRef.current, config];

      await writeStoredProviderConfigs(nextConfigs);
      commitConfigs(nextConfigs);

      return config;
    },
    [commitConfigs],
  );

  const removeProviderConfig = useCallback(
    async (configId: string) => {
      const nextConfigs = configsRef.current.filter(
        (config) => config.id !== configId,
      );

      await writeStoredProviderConfigs(nextConfigs);
      commitConfigs(nextConfigs);

      try {
        await removeStoredProviderApiKey(configId);
      } catch {
        // The removed configuration no longer references the stored key.
      }
    },
    [commitConfigs],
  );

  const value = useMemo(
    () => ({
      configs,
      getProviderApiKey,
      getProviderConfig,
      getProviderConfigById,
      isReady,
      removeProviderConfig,
      saveProviderConfig,
    }),
    [
      configs,
      getProviderApiKey,
      getProviderConfig,
      getProviderConfigById,
      isReady,
      removeProviderConfig,
      saveProviderConfig,
    ],
  );

  return (
    <ProviderSettingsContext.Provider value={value}>
      {children}
    </ProviderSettingsContext.Provider>
  );
}

export function useProviderSettings() {
  const context = useContext(ProviderSettingsContext);

  if (!context) {
    throw new Error('useProviderSettings must be used within ProviderSettingsProvider');
  }

  return context;
}
