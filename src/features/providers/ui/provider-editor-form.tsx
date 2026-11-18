import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProviderMark } from '@/components/provider-mark';
import { SelectableChipGroup } from '@/components/selectable-chip-group';
import { Button } from '@/components/ui/button';
import { FormField, FormSection, TextField } from '@/components/ui/form';
import { ScreenState } from '@/components/ui/screen-state';
import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import {
  Layout,
  MaxContentWidth,
  Radius,
  Spacing,
} from '@/constants/theme';
import { ProviderApiField } from '@/features/providers/ui/provider-api-field';
import { ProviderModelEditorModal } from '@/features/providers/ui/provider-model-editor-modal';
import { useProviderEditor } from '@/features/providers/model/use-provider-editor';
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
      <View style={[styles.stateScreen, { backgroundColor: theme.background }]}>
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
        <Surface radius={Radius.panel} style={styles.hero}>
          <ProviderMark
            borderRadius={Radius.panel}
            name={editor.name || '?'}
            providerId={editor.providerId || 'custom'}
            size={48}
          />
          <View style={styles.heroCopy}>
            <ThemedText
              type="smallBold"
              numberOfLines={1}
              style={styles.heroName}>
              {editor.name || '自定义供应商'}
            </ThemedText>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              numberOfLines={1}>
              {editor.providerId || 'custom'}
            </ThemedText>
          </View>
        </Surface>

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

        <FormSection title="API">
          <FormField label="API Key">
            <TextField
              autoCapitalize="none"
              autoCorrect={false}
              mono
              onChangeText={editor.setApiKey}
              placeholder="输入 API Key"
              secureTextEntry={!editor.showApiKey}
              trailing={
                <Pressable
                  accessibilityLabel={
                    editor.showApiKey ? '隐藏 API Key' : '显示 API Key'
                  }
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() =>
                    editor.setShowApiKey((currentValue) => !currentValue)
                  }>
                  <SymbolView
                    name={
                      editor.showApiKey
                        ? { ios: 'eye.slash.fill', android: 'visibility_off' }
                        : { ios: 'eye.fill', android: 'visibility' }
                    }
                    size={17}
                    tintColor={theme.textSecondary}
                  />
                </Pressable>
              }
              value={editor.apiKey}
            />
            {editor.keyLoadError ? (
              <ThemedText type="small" themeColor="textSecondary">
                无法读取已保存的密钥
              </ThemedText>
            ) : null}
          </FormField>

          <ProviderApiField onChange={editor.setApi} value={editor.api} />
        </FormSection>

        <FormSection title="模型">
          <View style={styles.modelActions}>
            <Button
              label="添加模型"
              leadingIcon={
                <SymbolView
                  name={{ ios: 'plus', android: 'add' }}
                  size={13}
                  tintColor={theme.accent}
                />
              }
              onPress={editor.models.openAddModel}
              size="compact"
              variant="soft"
            />

            {editor.canFetchModels ? (
              <Button
                label="获取模型"
                leadingIcon={
                  editor.isFetchingModels ? undefined : (
                    <SymbolView
                      name={{ ios: 'arrow.clockwise', android: 'refresh' }}
                      size={13}
                      tintColor={theme.accent}
                    />
                  )
                }
                loading={editor.isFetchingModels}
                onPress={() => {
                  void handleFetchModels();
                }}
                size="compact"
                variant="soft"
              />
            ) : null}
          </View>

          {editor.models.visibleModelOptions.length > 0 ? (
            <SelectableChipGroup
              onLongPress={editor.models.openModelEditor}
              onRemove={editor.models.removeModel}
              onToggle={editor.models.toggleModel}
              options={editor.models.visibleModelOptions.map((model) => ({
                label: model.id,
                value: model.id,
              }))}
              removable
              selectedValues={editor.models.selectedModels.map(
                (model) => model.id,
              )}
            />
          ) : null}
        </FormSection>

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
  hero: {
    minHeight: 72,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroCopy: {
    flex: 1,
    gap: 2,
  },
  heroName: {
    fontSize: 17,
    lineHeight: 22,
  },
  modelActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
});
