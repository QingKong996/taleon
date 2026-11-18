import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ScreenState } from '@/components/ui/screen-state';
import { ProviderEditorForm } from '@/features/providers/ui/provider-editor-form';
import { useProviderPresetModels } from '@/features/providers/model/use-provider-preset-models';
import { useTheme } from '@/hooks/use-theme';
import { getDefaultProviderApi } from '@/lib/provider-api';
import { useProviderSettings } from '@/providers/provider-settings';

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function ProviderEditorScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams();
  const configId = readParam(params.configId);
  const requestedProviderId = readParam(params.providerId);
  const requestedProviderName = readParam(params.providerName);
  const requestedProviderNpm = readParam(params.providerNpm);
  const requestedBaseUrl = readParam(params.providerBaseUrl);
  const isCustomRequest = readParam(params.custom) === '1';
  const { getProviderConfigById, isReady } = useProviderSettings();
  const existingConfig = configId
    ? getProviderConfigById(configId)
    : undefined;
  const initialProviderId =
    existingConfig?.providerId ?? requestedProviderId ?? '';
  const initialName =
    existingConfig?.name ?? requestedProviderName ?? initialProviderId;
  const initialApi =
    existingConfig?.api ??
    getDefaultProviderApi(initialProviderId, requestedProviderNpm);
  const initialCustom =
    existingConfig?.custom ??
    (isCustomRequest || (!requestedProviderId && !existingConfig));
  const presetModels = useProviderPresetModels(
    initialProviderId,
    !initialCustom,
  );
  const pageTitle = existingConfig
    ? '编辑供应商'
    : initialCustom
      ? '添加自定义供应商'
      : '添加供应商';

  if (!isReady) {
    return (
      <View style={[styles.stateScreen, { backgroundColor: theme.background }]}>
        <ScreenState loading title="加载供应商" />
      </View>
    );
  }

  if (configId && !existingConfig) {
    return (
      <View style={[styles.stateScreen, { backgroundColor: theme.background }]}>
        <ScreenState
          action={
            <Button
              label="返回"
              onPress={() => router.back()}
              variant="primary"
            />
          }
          title="找不到该供应商配置"
        />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: pageTitle }} />
      <ProviderEditorForm
        existingConfig={existingConfig}
        initialApi={initialApi}
        initialBaseUrl={existingConfig?.baseUrl ?? requestedBaseUrl ?? ''}
        initialCustom={initialCustom}
        initialModels={existingConfig?.models}
        initialName={initialName}
        initialProviderId={initialProviderId}
        presetModels={presetModels}
      />
    </>
  );
}

const styles = StyleSheet.create({
  stateScreen: {
    flex: 1,
  },
});
