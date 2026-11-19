import { router } from 'expo-router';
import { Alert } from 'react-native';

import type { useProviderEditor } from '@/features/providers/model/use-provider-editor';

type ProviderEditor = ReturnType<typeof useProviderEditor>;

export function useProviderEditorFormActions(editor: ProviderEditor) {
  function saveModel() {
    const errorMessage = editor.models.draft.save();

    if (errorMessage) {
      Alert.alert('无法保存模型', errorMessage);
    }
  }

  async function save() {
    try {
      const didSave = await editor.actions.save();

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

  async function fetchModels() {
    try {
      await editor.actions.fetchModels();
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
          editor.actions
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

  return {
    confirmRemove,
    fetchModels,
    save,
    saveModel,
  };
}
