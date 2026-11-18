import { ProviderIcon } from '@lobehub/icons-rn';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { getProviderIconKeyword } from '@/lib/provider/icon';

type ProviderMarkProps = {
  borderRadius?: number;
  name: string;
  providerId: string;
  size?: number;
};

export function ProviderMark({
  borderRadius,
  name,
  providerId,
  size = 38,
}: ProviderMarkProps) {
  const theme = useTheme();
  const iconKeyword = getProviderIconKeyword(providerId, name);
  const resolvedBorderRadius = borderRadius ?? Math.floor(size * 0.3);

  if (iconKeyword) {
    return (
      <ProviderIcon
        provider={iconKeyword}
        shape="square"
        size={size}
        style={{ borderRadius: resolvedBorderRadius }}
        type="avatar"
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          backgroundColor: theme.accentSoft,
          borderRadius: resolvedBorderRadius,
          height: size,
          width: size,
        },
      ]}>
      <ThemedText type="smallBold" themeColor="accent" style={styles.fallbackLabel}>
        {name.trim().slice(0, 1).toUpperCase() || '?'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackLabel: {
    fontSize: 16,
    lineHeight: 20,
  },
});
