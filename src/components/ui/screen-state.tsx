import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { Spinner } from '@/components/gluestack/spinner';
import { Text } from '@/components/gluestack/text';
import { VStack } from '@/components/gluestack/vstack';
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
    <VStack
      className="flex-1 items-center justify-center gap-3 px-8"
      style={style}>
      {loading ? <Spinner color={theme.accent} /> : null}
      {title || description ? (
        <VStack className="items-center gap-1">
          {title ? (
            <Text className="text-sm font-semibold text-foreground">
              {title}
            </Text>
          ) : null}
          {description ? (
            <Text className="text-center text-sm text-muted-foreground">
              {description}
            </Text>
          ) : null}
        </VStack>
      ) : null}
      {action}
    </VStack>
  );
}
