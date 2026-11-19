import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { ScreenState } from '@/components/ui/screen-state';
import { SearchField } from '@/components/ui/search-field';
import { Layout, Spacing } from '@/constants/theme';
import {
  useProviderCatalog,
  type ProviderCatalogItem,
  type ProviderCatalogStatus,
  type SavedProviderItem,
} from '@/features/providers/model/use-provider-catalog';
import { ProviderCatalogHeader } from '@/features/providers/ui/provider-catalog-header';
import { ProviderCatalogTile } from '@/features/providers/ui/provider-catalog-tile';
import { useProviderCatalogSearch } from '@/features/providers/ui/use-provider-catalog-search';
import { useTheme } from '@/hooks/use-theme';

export function ProviderCatalogScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { configs, isReady, providerItems, retry, savedItems, status } =
    useProviderCatalog();
  const {
    query,
    setQuery,
    visibleProviders,
    visibleSavedItems,
  } = useProviderCatalogSearch({ providerItems, savedItems });

  function openAddProvider() {
    router.push({
      pathname: '/settings/provider',
      params: { custom: '1' },
    });
  }

  function openSavedProvider(item: SavedProviderItem) {
    router.push({
      pathname: '/settings/provider',
      params: { configId: item.configId },
    });
  }

  function openProvider(item: ProviderCatalogItem) {
    router.push({
      pathname: '/settings/provider',
      params: {
        providerBaseUrl: item.baseUrl ?? '',
        providerId: item.providerId,
        providerName: item.name,
        providerNpm: item.npm ?? '',
      },
    });
  }

  if (!isReady) {
    return (
      <View style={[styles.stateScreen, { backgroundColor: theme.background }]}>
        <ScreenState
          description="正在读取已保存的供应商"
          loading
          title="加载供应商"
        />
      </View>
    );
  }

  const savedEmptyLabel =
    configs.length === 0 ? '尚未添加供应商' : '没有匹配的已保存供应商';
  const catalogCountLabel =
    status === 'loading'
      ? '加载中'
      : status === 'error'
        ? '加载失败'
        : `${visibleProviders.length} 个`;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.searchSection}>
        <SearchField
          accessibilityLabel="搜索供应商"
          onChangeText={setQuery}
          placeholder="搜索供应商"
          value={query}
        />
      </View>

      <FlatList
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.six },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        data={visibleProviders}
        initialNumToRender={16}
        ItemSeparatorComponent={ProviderSeparator}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        keyExtractor={(provider) => provider.providerId}
        ListEmptyComponent={renderCatalogListState(status, retry)}
        ListHeaderComponent={
          <ProviderCatalogHeader
            catalogCountLabel={catalogCountLabel}
            onAddProvider={openAddProvider}
            onOpenSavedProvider={openSavedProvider}
            savedEmptyLabel={savedEmptyLabel}
            savedItems={visibleSavedItems}
          />
        }
        maxToRenderPerBatch={16}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <ProviderCatalogTile
              item={item}
              onPress={() => openProvider(item)}
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
        windowSize={8}
      />
    </View>
  );
}

function ProviderSeparator() {
  return <View style={styles.separator} />;
}

function renderCatalogListState(
  status: ProviderCatalogStatus,
  onRetry: () => void,
) {
  if (status === 'loading') {
    return (
      <ScreenState
        description="正在从 models.dev 获取模型列表"
        loading
        style={styles.listState}
      />
    );
  }

  if (status === 'error') {
    return (
      <ScreenState
        action={
          <Button
            label="重试"
            onPress={onRetry}
            size="compact"
            variant="soft"
          />
        }
        description="请检查网络连接后重试"
        style={styles.listState}
        title="无法加载供应商"
      />
    );
  }

  return (
    <ScreenState
      description="没有匹配的供应商"
      style={styles.listState}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  stateScreen: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: Layout.compactScreenPadding,
    paddingTop: Layout.compactScreenPadding,
    paddingBottom: Layout.compactScreenPadding,
  },
  listContent: {
    paddingHorizontal: Layout.compactScreenPadding,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48.5%',
  },
  separator: {
    height: 5,
  },
  listState: {
    flex: 0,
    minHeight: 180,
    paddingVertical: 32,
  },
});
