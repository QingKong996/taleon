import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { FormField, TextField } from '@/components/ui/form';
import { ThemedText } from '@/components/themed-text';
import { Layout, Radius } from '@/constants/theme';
import type { ProviderModelDraft } from '@/features/providers/provider-model-draft';
import { useTheme } from '@/hooks/use-theme';

type ProviderModelEditorModalProps = {
  draft: ProviderModelDraft | null;
  onChange: (draft: ProviderModelDraft) => void;
  onClose: () => void;
  onSave: () => void;
};

type ModelLimits = {
  contextWindow: string;
  maxTokens: string;
};

export function ProviderModelEditorModal({
  draft,
  onChange,
  onClose,
  onSave,
}: ProviderModelEditorModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isEditing = draft?.mode === 'edit';

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={draft !== null}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalRoot}>
        <Pressable
          accessibilityLabel="关闭模型编辑"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.modalBackdrop}
        />

        {draft ? (
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.backgroundSelected,
                paddingBottom: insets.bottom + 16,
              },
            ]}>
            <View style={styles.modalHeader}>
              <ThemedText type="smallBold" style={styles.modalTitle}>
                {isEditing ? '编辑模型' : '添加模型'}
              </ThemedText>
              <View style={styles.modalHeaderActions}>
                <Button
                  label="取消"
                  onPress={onClose}
                  size="compact"
                  variant="secondary"
                />
                <Button
                  label="保存"
                  onPress={onSave}
                  size="compact"
                  variant="primary"
                />
              </View>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalFields}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <TextField
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                label="模型 ID"
                mono
                onChangeText={(id) => onChange({ ...draft, id })}
                placeholder="model-id"
                value={draft.id}
              />
              <ModelLimitsFields
                onChange={(limits) => onChange({ ...draft, ...limits })}
                value={{
                  contextWindow: draft.contextWindow,
                  maxTokens: draft.maxTokens,
                }}
              />
            </ScrollView>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </Modal>
  );
}

type ModelLimitsFieldsProps = {
  onChange: (limits: ModelLimits) => void;
  value: ModelLimits;
};

function ModelLimitsFields({ onChange, value }: ModelLimitsFieldsProps) {
  return (
    <>
      <FormField label="上下文长度">
        <TextField
          keyboardType="number-pad"
          mono
          onChangeText={(contextWindow) =>
            onChange({ ...value, contextWindow })
          }
          placeholder="128000"
          value={value.contextWindow}
        />
      </FormField>

      <FormField label="最大输出长度">
        <TextField
          keyboardType="number-pad"
          mono
          onChangeText={(maxTokens) => onChange({ ...value, maxTokens })}
          placeholder="8192"
          value={value.maxTokens}
        />
      </FormField>
    </>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalSheet: {
    width: '92%',
    maxWidth: 560,
    maxHeight: '88%',
    alignSelf: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sheet,
    paddingHorizontal: Layout.formPadding,
    paddingTop: Layout.formPadding,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modalTitle: {
    fontSize: 17,
    lineHeight: 22,
  },
  modalFields: {
    gap: 16,
  },
});
