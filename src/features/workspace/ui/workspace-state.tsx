import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { TabScrollView } from '@/components/tab-scroll-view';
import { ScreenState } from '@/components/ui/screen-state';

type WorkspaceStateProps = {
  action?: ReactNode;
  description?: string;
  loading?: boolean;
  title: string;
};

export function WorkspaceState({
  action,
  description,
  loading = false,
  title,
}: WorkspaceStateProps) {
  return (
    <TabScrollView contentContainerStyle={styles.content}>
      <ScreenState
        action={action}
        description={description}
        loading={loading}
        title={title}
      />
    </TabScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
});
