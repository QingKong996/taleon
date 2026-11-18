import type { KnownApi } from '@earendil-works/pi-ai';
import { MenuView } from '@expo/ui/community/menu';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import {
  isKnownProviderApi,
  PROVIDER_API_OPTIONS,
} from '@/lib/provider/api';

type ProviderApiFieldProps = {
  onChange: (api: KnownApi) => void;
  value: KnownApi;
};

export function ProviderApiField({
  onChange,
  value,
}: ProviderApiFieldProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme();

  return (
    <View style={styles.field}>
      <ThemedText type="small" themeColor="textSecondary">
        API 协议
      </ThemedText>
      <MenuView
        actions={PROVIDER_API_OPTIONS.map((option) => ({
          id: option.value,
          state: value === option.value ? 'on' : undefined,
          title: option.label,
        }))}
        colorScheme={colorScheme}
        onPressAction={({ nativeEvent }) => {
          if (isKnownProviderApi(nativeEvent.event)) {
            onChange(nativeEvent.event);
          }
        }}
        style={styles.menu}>
        <View
          accessibilityLabel="API 协议"
          accessibilityRole="button"
          style={[
            styles.trigger,
            {
              backgroundColor: theme.backgroundSelected,
              borderColor: theme.backgroundSelected,
            },
          ]}>
          <ThemedText
            numberOfLines={1}
            type="smallBold"
            style={styles.triggerLabel}>
            {
              PROVIDER_API_OPTIONS.find((option) => option.value === value)
                ?.label
            }
          </ThemedText>
          <SymbolView
            name={{
              ios: 'chevron.up.chevron.down',
              android: 'unfold_more',
            }}
            size={13}
            tintColor={theme.textSecondary}
          />
        </View>
      </MenuView>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  menu: {
    maxWidth: '72%',
    flexShrink: 1,
  },
  trigger: {
    minHeight: 36,
    borderRadius: Radius.compact,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  triggerLabel: {
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 16,
  },
});
