import { StyleSheet, View } from 'react-native';

import { ProviderMark } from '@/components/provider-mark';
import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';

type ProviderEditorHeroProps = {
  name: string;
  providerId: string;
};

export function ProviderEditorHero({
  name,
  providerId,
}: ProviderEditorHeroProps) {
  return (
    <Surface radius={Radius.panel} style={styles.hero}>
      <ProviderMark
        borderRadius={Radius.panel}
        name={name || '?'}
        providerId={providerId || 'custom'}
        size={48}
      />
      <View style={styles.copy}>
        <ThemedText
          type="smallBold"
          numberOfLines={1}
          style={styles.name}>
          {name || '自定义供应商'}
        </ThemedText>
        <ThemedText
          type="small"
          themeColor="textSecondary"
          numberOfLines={1}>
          {providerId || 'custom'}
        </ThemedText>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 72,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 17,
    lineHeight: 22,
  },
});
