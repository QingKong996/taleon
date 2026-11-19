import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';
import { ThemedText } from '@/components/themed-text';
import type { SavedProviderItem } from '@/features/providers/model/use-provider-catalog';
import { ProviderCatalogTile } from '@/features/providers/ui/provider-catalog-tile';
import { useTheme } from '@/hooks/use-theme';

type ProviderCatalogHeaderProps = {
  catalogCountLabel: string;
  onAddProvider: () => void;
  onOpenSavedProvider: (item: SavedProviderItem) => void;
  savedEmptyLabel: string;
  savedItems: readonly SavedProviderItem[];
};

export function ProviderCatalogHeader({
  catalogCountLabel,
  onAddProvider,
  onOpenSavedProvider,
  savedEmptyLabel,
  savedItems,
}: ProviderCatalogHeaderProps) {
  const theme = useTheme();

  return (
    <>
      <View style={styles.savedSection}>
        <SectionHeader
          detail={`${savedItems.length} 个`}
          title="已保存供应商"
        />
        {savedItems.length > 0 ? (
          <View style={styles.savedGrid}>
            {savedItems.map((item) => (
              <View key={item.configId} style={styles.gridItem}>
                <ProviderCatalogTile
                  item={item}
                  onPress={() => onOpenSavedProvider(item)}
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
              onPress={onAddProvider}
              size="compact"
              variant="soft"
            />
          }
          detail={catalogCountLabel}
          title="全部供应商"
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
  gridItem: {
    width: '48.5%',
  },
  savedEmpty: {
    paddingVertical: 12,
  },
  catalogHeader: {
    paddingBottom: 8,
  },
});
