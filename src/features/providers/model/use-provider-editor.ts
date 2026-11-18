import { useEffect, useState } from 'react';

import { useProviderModels } from '@/features/providers/model/use-provider-models';
import {
  getDefaultProviderApi,
  isKnownProviderApi,
  normalizeBaseUrl,
} from '@/lib/provider-api';
import type {
  ProviderConfig,
  ProviderModel,
} from '@/lib/provider-config';
import {
  fetchOpenAiModels,
  supportsOpenAiModelList,
} from '@/lib/provider-models';
import { useProviderSettings } from '@/providers/provider-settings';

type UseProviderEditorOptions = {
  existingConfig?: ProviderConfig;
  initialApi: string;
  initialBaseUrl: string;
  initialCustom: boolean;
  initialModels?: readonly ProviderModel[];
  initialName: string;
  initialProviderId: string;
  presetModels: readonly ProviderModel[];
};

export function useProviderEditor({
  existingConfig,
  initialApi,
  initialBaseUrl,
  initialCustom,
  initialModels,
  initialName,
  initialProviderId,
  presetModels,
}: UseProviderEditorOptions) {
  const {
    getProviderApiKey,
    removeProviderConfig,
    saveProviderConfig,
  } = useProviderSettings();
  const [name, setName] = useState(initialName);
  const [providerId, setProviderId] = useState(initialProviderId);
  const [api, setApi] = useState(() =>
    isKnownProviderApi(initialApi)
      ? initialApi
      : getDefaultProviderApi(initialProviderId),
  );
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState(initialBaseUrl);
  const [showApiKey, setShowApiKey] = useState(false);
  const [keyLoadError, setKeyLoadError] = useState(false);
  const [isApiKeyLoaded, setIsApiKeyLoaded] = useState(!existingConfig);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const models = useProviderModels({
    initialModels,
    presetModels,
  });
  const canFetchModels = supportsOpenAiModelList(api);

  useEffect(() => {
    if (!existingConfig || isApiKeyLoaded) {
      return;
    }

    let isMounted = true;

    getProviderApiKey(existingConfig.id)
      .then((storedApiKey) => {
        if (isMounted) {
          setApiKey(storedApiKey ?? '');
        }
      })
      .catch(() => {
        if (isMounted) {
          setKeyLoadError(true);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsApiKeyLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [existingConfig, getProviderApiKey, isApiKeyLoaded]);

  async function save() {
    if (isSaving) {
      return false;
    }

    setIsSaving(true);

    try {
      const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

      if (!name.trim()) {
        throw new Error('请输入供应商名称');
      }

      if (initialCustom && !providerId.trim()) {
        throw new Error('请输入供应商 ID');
      }

      await saveProviderConfig(
        {
          api,
          baseUrl: normalizedBaseUrl,
          custom: initialCustom,
          id: existingConfig?.id,
          models: models.selectedModels,
          name,
          providerId: initialCustom
            ? providerId
            : existingConfig?.providerId ?? providerId,
        },
        existingConfig && keyLoadError && !apiKey.trim()
          ? undefined
          : apiKey,
      );

      return true;
    } finally {
      setIsSaving(false);
    }
  }

  async function fetchModels() {
    if (isFetchingModels || !canFetchModels) {
      return;
    }

    setIsFetchingModels(true);

    try {
      const modelIds = await fetchOpenAiModels({
        api,
        apiKey,
        baseUrl,
      });

      models.addModelIds(modelIds);
    } finally {
      setIsFetchingModels(false);
    }
  }

  async function remove() {
    if (!existingConfig || isSaving) {
      return false;
    }

    setIsSaving(true);

    try {
      await removeProviderConfig(existingConfig.id);
      return true;
    } finally {
      setIsSaving(false);
    }
  }

  return {
    api,
    apiKey,
    baseUrl,
    canFetchModels,
    fetchModels,
    isApiKeyLoaded,
    isFetchingModels,
    isSaving,
    keyLoadError,
    models,
    name,
    providerId,
    remove,
    save,
    setApi,
    setApiKey,
    setBaseUrl,
    setName,
    setProviderId,
    setShowApiKey,
    showApiKey,
  };
}
