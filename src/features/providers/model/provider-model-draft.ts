import type { ProviderModel } from '@/lib/provider/config';

export type ProviderModelDraft = {
  contextWindow: string;
  id: string;
  maxTokens: string;
  mode: 'add' | 'edit';
  originalId?: string;
};

export type ProviderModelDraftResult =
  | { error: string }
  | { model: ProviderModel };

function parseOptionalPositiveInteger(value: string, label: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return undefined;
  }

  const parsedValue = Number(normalizedValue);

  if (
    !/^\d+$/.test(normalizedValue) ||
    !Number.isSafeInteger(parsedValue) ||
    parsedValue <= 0
  ) {
    throw new Error(`${label}必须是正整数`);
  }

  return parsedValue;
}

export function createModelFromDraft(
  draft: ProviderModelDraft,
  existingModels: readonly ProviderModel[],
): ProviderModelDraftResult {
  const id = draft.id.trim();

  if (!id) {
    return { error: '请输入模型 ID' };
  }

  let contextWindow: number | undefined;
  let maxTokens: number | undefined;

  try {
    contextWindow = parseOptionalPositiveInteger(
      draft.contextWindow,
      '上下文长度',
    );
    maxTokens = parseOptionalPositiveInteger(
      draft.maxTokens,
      '最大输出长度',
    );
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : '模型信息格式无效',
    };
  }

  const originalId = draft.mode === 'edit' ? draft.originalId : undefined;
  const hasDuplicateId = existingModels.some(
    (model) => model.id === id && model.id !== originalId,
  );

  if (hasDuplicateId) {
    return { error: '模型 ID 已存在' };
  }

  return {
    model: {
      contextWindow,
      id,
      maxTokens,
    },
  };
}
