import { useEffect, useState } from 'react';

import {
  fetchModelsDevCatalog,
  getModelsDevModels,
} from '@/lib/provider/models-dev';
import type { ProviderModel } from '@/lib/provider/config';

export function useProviderPresetModels(
  providerId: string,
  enabled: boolean,
) {
  const [result, setResult] = useState<{
    models: ProviderModel[];
    providerId: string;
  } | null>(null);

  useEffect(() => {
    if (!enabled || !providerId) {
      return;
    }

    const controller = new AbortController();

    fetchModelsDevCatalog({ signal: controller.signal })
      .then((catalog) => {
        if (controller.signal.aborted) {
          return;
        }

        const provider = catalog.find(
          (catalogProvider) => catalogProvider.id === providerId,
        );

        setResult({
          models: provider
            ? getModelsDevModels(provider).map((model) => ({
                contextWindow: model.limit?.context,
                id: model.id,
                maxTokens: model.limit?.output,
              }))
            : [],
          providerId,
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResult({ models: [], providerId });
        }
      });

    return () => {
      controller.abort();
    };
  }, [enabled, providerId]);

  return enabled && result?.providerId === providerId
    ? result.models
    : [];
}
