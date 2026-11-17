import { useEffect, useState } from 'react';

import {
  fetchModelsDevCatalog,
  getModelsDevModels,
} from '@/lib/models-dev';
import type { ProviderModel } from '@/lib/provider-config';

export function useProviderPresetModels(
  providerId: string,
  enabled: boolean,
) {
  const [models, setModels] = useState<ProviderModel[]>([]);

  useEffect(() => {
    if (!enabled || !providerId) {
      setModels([]);
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

        setModels(
          provider
            ? getModelsDevModels(provider).map((model) => ({
                contextWindow: model.limit?.context,
                id: model.id,
                maxTokens: model.limit?.output,
              }))
            : [],
        );
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setModels([]);
        }
      });

    return () => {
      controller.abort();
    };
  }, [enabled, providerId]);

  return models;
}
