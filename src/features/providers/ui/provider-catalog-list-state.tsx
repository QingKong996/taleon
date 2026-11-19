import { StyleSheet } from 'react-native';

import { Button } from '@/components/ui/button';
import { ScreenState } from '@/components/ui/screen-state';
import type { ProviderCatalogStatus } from '@/features/providers/model/use-provider-catalog';

type ProviderCatalogListStateProps = {
  onRetry: () => void;
  status: ProviderCatalogStatus;
};

export function ProviderCatalogListState({
  onRetry,
  status,
}: ProviderCatalogListStateProps) {
  if (status === 'loading') {
    return (
      <ScreenState
        description="正在从 models.dev 获取模型列表"
        loading
        style={styles.state}
      />
    );
  }

  if (status === 'error') {
    return (
      <ScreenState
        action={
          <Button
            label="重试"
            onPress={onRetry}
            size="compact"
            variant="soft"
          />
        }
        description="请检查网络连接后重试"
        style={styles.state}
        title="无法加载供应商"
      />
    );
  }

  return (
    <ScreenState
      description="没有匹配的供应商"
      style={styles.state}
    />
  );
}

const styles = StyleSheet.create({
  state: {
    flex: 0,
    minHeight: 180,
    paddingVertical: 32,
  },
});
