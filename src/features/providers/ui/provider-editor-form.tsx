import { router } from 'expo-router';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { FormSection, TextField } from '@/components/ui/form';
import { ScreenState } from '@/components/ui/screen-state';
import {
  Layout,
  MaxContentWidth,
  Spacing,
} from '@/constants/theme';
import { useProviderEditor } from '@/features/providers/model/use-provider-editor';
import { ProviderApiSection } from '@/features/providers/ui/provider-api-section';
import { ProviderEditorHero } from '@/features/providers/ui/provider-editor-hero';
import { ProviderModelEditorModal } from '@/features/providers/ui/provider-model-editor-modal';
import { ProviderModelsSection } from '@/features/providers/ui/provider-models-section';
import { useTheme } from '@/hooks/use-theme';
import type {
  ProviderConfig,
  ProviderModel,
} from '@/lib/provider/config';

type ProviderEditorFormProps = {
  existingConfig?: ProviderConfig;
  initialApi: string;
  initialBaseUrl: string;
  initialCustom: boolean;
  initialModels?: readonly ProviderModel[];
  initialName: string;
  initialProviderId: string;
  presetModels: readonly ProviderModel[];
};

export function ProviderEditorForm({
  existingConfig,
  initialApi,
  initialBaseUrl,
  initialCustom,
  initialModels,
  initialName,
  initialProviderId,
  presetModels,
}: ProviderEditorFormProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const editor = useProviderEditor({
    existingConfig,
    initialApi,
    initialBaseUrl,
    initialCustom,
    initialModels,
    initialName,
    initialProviderId,
    presetModels,
  });

  function handleSaveModel() {
    const errorMessage = editor.models.saveModelDraft();

    if (errorMessage) {
      Alert.alert('无法保存模型', errorMessage);
    }
  }

  async function handleSave() {
    try {
      const didSave = await editor.save();

      if (didSave) {
        router.back();
      }
    } catch (error) {
      Alert.alert(
        '无法保存',
        error instanceof Error ? error.message : '请稍后重试',
      );
    }
  }

  async function handleFetchModels() {
    try {
      await editor.fetchModels();
    } catch (error) {
      Alert.alert(
        '无法获取模型',
        error instanceof Error ? error.message : '请稍后重试',
      );
    }
  }

  function confirmRemove() {
    Alert.alert('移除供应商', '将同时删除已保存的 API Key。', [
      { style: 'cancel', text: '取消' },
      {
        onPress: () => {
          editor
            .remove()
            .then((didRemove) => {
              if (didRemove) {
                router.back();
              }
            })
            .catch((error: unknown) => {
              Alert.alert(
                '无法移除',
                error instanceof Error ? error.message : '请稍后重试',
              );
            });
        },
        style: 'destructive',
        text: '移除',
      },
    ]);
  }

  if (!editor.isApiKeyLoaded) {
    return (
      <View
        style={[
          styles.stateScreen,
          { backgroundColor: theme.background },
        ]}>
        <ScreenState loading title="读取供应商" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.five },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <ProviderEditorHero
          name={editor.name}
          providerId={editor.providerId}
        />

        <FormSection title="供应商">
          <TextField
            autoCapitalize="none"
            autoCorrect={false}
            label="名称"
            onChangeText={editor.setName}
            placeholder="供应商名称"
            value={editor.name}
          />

          {initialCustom ? (
            <TextField
              autoCapitalize="none"
              autoCorrect={false}
              label="供应商 ID"
              mono
              onChangeText={editor.setProviderId}
              placeholder="provider-id"
              value={editor.providerId}
            />
          ) : null}
        </FormSection>

        <ProviderApiSection
          api={editor.api}
          apiKey={editor.apiKey}
          keyLoadError={editor.keyLoadError}
          onChangeApi={editor.setApi}
          onChangeApiKey={editor.setApiKey}
          onToggleApiKeyVisibility={() =>
            editor.setShowApiKey((currentValue) => !currentValue)
          }
          showApiKey={editor.showApiKey}
        />

        <ProviderModelsSection
          canFetchModels={editor.canFetchModels}
          fetchingModels={editor.isFetchingModels}
          onAddModel={editor.models.openAddModel}
          onFetchModels={() => {
            void handleFetchModels();
          }}
          onLongPressModel={editor.models.openModelEditor}
          onRemoveModel={editor.models.removeModel}
          onToggleModel={editor.models.toggleModel}
          selectedModels={editor.models.selectedModels}
          visibleModelOptions={editor.models.visibleModelOptions}
        />

        <FormSection title="端点">
          <TextField
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            label="Base URL"
            mono
            onChangeText={editor.setBaseUrl}
            placeholder="https://api.example.com/v1"
            value={editor.baseUrl}
          />
        </FormSection>

        <Button
          disabled={editor.isSaving}
          label="保存"
          loading={editor.isSaving}
          onPress={() => {
            void handleSave();
          }}
        />

        {existingConfig ? (
          <Button
            disabled={editor.isSaving}
            label="移除供应商"
            onPress={confirmRemove}
            variant="secondary"
          />
        ) : null}
      </ScrollView>

      <ProviderModelEditorModal
        draft={editor.models.draft}
        onChange={editor.models.setDraft}
        onClose={editor.models.closeModelEditor}
        onSave={handleSaveModel}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  stateScreen: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Layout.formPadding,
    paddingTop: Layout.formPadding,
    gap: Layout.formPadding,
  },
});
