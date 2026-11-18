import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { ScreenState } from '@/components/ui/screen-state';
import { SearchField } from '@/components/ui/search-field';
import { SectionHeader } from '@/components/ui/section-header';
import { ThemedText } from '@/components/themed-text';
import { Layout, Spacing } from '@/constants/theme';
import { ProviderCatalogTile } from '@/features/providers/ui/provider-catalog-tile';
import {
  useProviderCatalog,
  type ProviderCatalogItem,
  type SavedProviderItem,
} from '@/features/providers/model/use-provider-catalog';
import { useTheme } from '@/hooks/use-theme';

export function ProviderCatalogScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { configs, isReady, providerItems, retry, savedItems, status } =
    useProviderCatalog();
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
        ListEmptyComponent={
          status === 'loading' ? (
            <ScreenState
              description="正在从 models.dev 获取模型列表"
              loading
              style={styles.listState}
            />
          ) : status === 'error' ? (
            <ScreenState
              action={
                <Button
                  label="重试"
                  onPress={retry}
                  size="compact"
                  variant="soft"
                />
              }
              description="请检查网络连接后重试"
              style={styles.listState}
              title="无法加载供应商"
            />
          ) : (
            <ScreenState
              description="没有匹配的供应商"
              style={styles.listState}
            />
          )
        }
        ListHeaderComponent={
          <>
            <View style={styles.savedSection}>
              <SectionHeader
                detail={`${visibleSavedItems.length} 个`}
                title="已保存供应商"
              />
              {visibleSavedItems.length > 0 ? (
                <View style={styles.savedGrid}>
                  {visibleSavedItems.map((item) => (
                    <View key={item.configId} style={styles.gridItem}>
                      <ProviderCatalogTile
                        item={item}
                        onPress={() => openSavedProvider(item)}
                        saved
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                  style={styles.savedEmpty}>
                  {savedEmptyLabel}
                </ThemedText>
              )}
            </View>

            <View style={styles.catalogHeader}>
              <SectionHeader
                action={
                  <Button
                    label="自定义"
                    leadingIcon={
                      <SymbolView
                        name={{ ios: 'plus', android: 'add' }}
                        size={12}
                        tintColor={theme.accent}
                      />
                    }
                    onPress={openAddProvider}
                    size="compact"
                    variant="soft"
                  />
                }
                detail={catalogCountLabel}
                title="全部供应商"
              />
            </View>
          </>
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
  savedSection: {
    gap: 6,
    paddingBottom: 14,
  },
  savedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 5,
  },
  savedEmpty: {
    paddingVertical: 12,
  },
  catalogHeader: {
    paddingBottom: 8,
  },
  listState: {
    flex: 0,
    minHeight: 180,
    paddingVertical: 32,
  },
});
