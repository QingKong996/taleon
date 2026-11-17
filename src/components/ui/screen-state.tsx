import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type ScreenStateProps = {
  action?: ReactNode;
  description?: string;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  title?: string;
};

export function ScreenState({
  action,
  description,
  loading = false,
  style,
  title,
}: ScreenStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.state, style]}>
      {loading ? <ActivityIndicator color={theme.accent} /> : null}
      {title || description ? (
        <View style={styles.copy}>
          {title ? <ThemedText type="smallBold">{title}</ThemedText> : null}
          {description ? (
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.description}>
              {description}
            </ThemedText>
          ) : null}
        </View>
      ) : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  copy: {
    alignItems: 'center',
    gap: 4,
  },
  description: {
    textAlign: 'center',
  },
});
