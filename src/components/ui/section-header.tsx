import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

type SectionHeaderProps = {
  action?: ReactNode;
  detail?: ReactNode;
  title: string;
};

export function SectionHeader({ action, detail, title }: SectionHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.heading}>
        <ThemedText type="smallBold" style={styles.title}>
          {title}
        </ThemedText>
        {detail ? (
          <ThemedText type="small" themeColor="textSecondary">
            {detail}
          </ThemedText>
        ) : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  title: {
    fontSize: 13,
    lineHeight: 18,
  },
});
