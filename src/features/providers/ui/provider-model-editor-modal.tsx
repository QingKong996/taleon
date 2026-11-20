import { ScrollView } from 'react-native';

import { HStack } from '@/components/gluestack/hstack';
import { Text } from '@/components/gluestack/text';
import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import { Button } from '@/components/ui/button';
import { FormField, TextField } from '@/components/ui/form';
import type { ProviderModelDraft } from '@/features/providers/model/provider-model-draft';

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
  const isEditing = draft?.mode === 'edit';

  return (
    <BottomSheetModal
      accessibilityLabel="关闭模型编辑"
      isOpen={draft !== null}
      onClose={onClose}>
      {draft ? (
        <>
          <HStack className="items-center justify-between gap-3">
            <Text className="text-[17px] font-semibold leading-[22px] text-foreground">
              {isEditing ? '编辑模型' : '添加模型'}
            </Text>
            <HStack className="gap-2">
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
            </HStack>
          </HStack>

          <ScrollView
            className="max-h-full flex-shrink"
            contentContainerStyle={{ gap: 16 }}
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
        </>
      ) : null}
    </BottomSheetModal>
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
