import { StyleSheet } from 'react-native';

import { ProviderMark } from '@/components/provider-mark';
import { PressableSurface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';

type ProviderCatalogTileProps = {
  item: {
    name: string;
    providerId: string;
  };
  onPress: () => void;
  saved?: boolean;
};

export function ProviderCatalogTile({
  item,
  onPress,
  saved = false,
}: ProviderCatalogTileProps) {
  return (
    <PressableSurface
      accessibilityLabel={`${item.name}${saved ? '，已保存' : ''}`}
      accessibilityRole="button"
      onPress={onPress}
      radius={Radius.compact}
      style={styles.tile}>
      <ProviderMark
        borderRadius={Radius.compact}
        name={item.name}
        providerId={item.providerId}
        size={24}
      />
      <ThemedText
        numberOfLines={1}
        type="smallBold"
        style={styles.name}>
        {item.name}
      </ThemedText>
    </PressableSurface>
  );
}

const styles = StyleSheet.create({
  tile: {
    minHeight: 38,
    paddingHorizontal: 6,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4,
    fontSize: 12,
    lineHeight: 16,
  },
});
