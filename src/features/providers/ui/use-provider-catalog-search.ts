import { useMemo, useState } from 'react';

import type {
  ProviderCatalogItem,
  SavedProviderItem,
} from '@/features/providers/model/use-provider-catalog';

type UseProviderCatalogSearchOptions = {
  providerItems: readonly ProviderCatalogItem[];
  savedItems: readonly SavedProviderItem[];
};

export function useProviderCatalogSearch({
  providerItems,
  savedItems,
}: UseProviderCatalogSearchOptions) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();

  const visibleProviders = useMemo(() => {
    if (!normalizedQuery) {
      return providerItems;
    }

    return providerItems.filter(
      (provider) =>
        provider.name.toLowerCase().includes(normalizedQuery) ||
        provider.providerId.toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery, providerItems]);

  const visibleSavedItems = useMemo(() => {
    if (!normalizedQuery) {
      return savedItems;
    }

    return savedItems.filter(
      (provider) =>
        provider.name.toLowerCase().includes(normalizedQuery) ||
        provider.providerId.toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery, savedItems]);

  return {
    query,
    setQuery,
    visibleProviders,
    visibleSavedItems,
  };
}
