import {
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
import { Layout, MaxContentWidth, Spacing } from '@/constants/theme';
import { useProviderEditor } from '@/features/providers/model/use-provider-editor';
import { ProviderApiSection } from '@/features/providers/ui/provider-api-section';
import { ProviderEditorHero } from '@/features/providers/ui/provider-editor-hero';
import { ProviderModelEditorModal } from '@/features/providers/ui/provider-model-editor-modal';
import { ProviderModelsSection } from '@/features/providers/ui/provider-models-section';
import { useProviderEditorFormActions } from '@/features/providers/ui/use-provider-editor-form-actions';
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
  const actions = useProviderEditorFormActions(editor);

  if (!editor.status.isApiKeyLoaded) {
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
          name={editor.identity.name}
          providerId={editor.identity.providerId}
        />

        <FormSection title="供应商">
          <TextField
            autoCapitalize="none"
            autoCorrect={false}
            label="名称"
            onChangeText={editor.identity.setName}
            placeholder="供应商名称"
            value={editor.identity.name}
          />

          {initialCustom ? (
            <TextField
              autoCapitalize="none"
              autoCorrect={false}
              label="供应商 ID"
              mono
              onChangeText={editor.identity.setProviderId}
              placeholder="provider-id"
              value={editor.identity.providerId}
            />
          ) : null}
        </FormSection>

        <ProviderApiSection
          api={editor.connection.api}
          apiKey={editor.connection.apiKey}
          keyLoadError={editor.connection.keyLoadError}
          onChangeApi={editor.connection.setApi}
          onChangeApiKey={editor.connection.setApiKey}
          onToggleApiKeyVisibility={
            editor.connection.toggleApiKeyVisibility
          }
          showApiKey={editor.connection.showApiKey}
        />

        <ProviderModelsSection
          canFetchModels={editor.status.canFetchModels}
          fetchingModels={editor.status.isFetchingModels}
          onAddModel={editor.models.draft.openAdd}
          onFetchModels={() => {
            void actions.fetchModels();
          }}
          onLongPressModel={editor.models.draft.openEdit}
          onRemoveModel={editor.models.list.removeModel}
          onToggleModel={editor.models.list.toggleModel}
          selectedModels={editor.models.list.selectedModels}
          visibleModelOptions={editor.models.list.visibleModelOptions}
        />

        <FormSection title="端点">
          <TextField
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            label="Base URL"
            mono
            onChangeText={editor.connection.setBaseUrl}
            placeholder="https://api.example.com/v1"
            value={editor.connection.baseUrl}
          />
        </FormSection>

        <Button
          disabled={editor.status.isSaving}
          label="保存"
          loading={editor.status.isSaving}
          onPress={() => {
            void actions.save();
          }}
        />

        {existingConfig ? (
          <Button
            disabled={editor.status.isSaving}
            label="移除供应商"
            onPress={actions.confirmRemove}
            variant="secondary"
          />
        ) : null}
      </ScrollView>

      <ProviderModelEditorModal
        draft={editor.models.draft.value}
        onChange={editor.models.draft.set}
        onClose={editor.models.draft.close}
        onSave={actions.saveModel}
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
