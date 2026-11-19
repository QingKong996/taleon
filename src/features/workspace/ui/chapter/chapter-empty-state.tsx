import { StyleSheet } from 'react-native';

import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';

type ChapterEmptyStateProps = {
  actionLabel?: string;
  description: string;
  onAction?: () => void;
  radius?: number;
  title: string;
};

export function ChapterEmptyState({
  actionLabel,
  description,
  onAction,
  radius = Radius.control,
  title,
}: ChapterEmptyStateProps) {
  return (
    <Surface radius={radius} style={styles.container}>
      <ThemedText type="smallBold">{title}</ThemedText>
      <ThemedText
        type="small"
        themeColor="textSecondary"
        style={styles.copy}>
        {description}
      </ThemedText>
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          size="compact"
          variant="secondary"
        />
      ) : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
    padding: 18,
  },
  copy: {
    textAlign: 'center',
  },
});
