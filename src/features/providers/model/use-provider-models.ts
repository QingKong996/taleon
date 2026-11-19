import { useEffect, useMemo, useState } from 'react';

import type { ProviderModelDraft } from '@/features/providers/model/provider-model-draft';
import type { ProviderModel } from '@/lib/provider/config';

type UseProviderModelsOptions = {
  initialModels?: readonly ProviderModel[];
  presetModels: readonly ProviderModel[];
};

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

export function useProviderModels({
  initialModels,
  presetModels,
}: UseProviderModelsOptions) {
  const [selectedModels, setSelectedModels] = useState<ProviderModel[]>(() => [
    ...(initialModels ?? []),
  ]);
  const [modelOptions, setModelOptions] = useState<ProviderModel[]>(() => [
    ...presetModels,
  ]);
  const [draft, setDraft] = useState<ProviderModelDraft | null>(null);

  useEffect(() => {
    // Preset models load asynchronously and enrich the editable model list.
    /* eslint-disable react-hooks/set-state-in-effect */
    setModelOptions((currentOptions) => {
      const optionsById = new Map(
        currentOptions.map((option) => [option.id, option] as const),
      );

      for (const option of presetModels) {
        if (!optionsById.has(option.id)) {
          optionsById.set(option.id, option);
        }
      }

      return [...optionsById.values()];
    });

    setSelectedModels((currentModels) => {
      const presetsById = new Map(
        presetModels.map((model) => [model.id, model] as const),
      );
      let hasChanged = false;
      const nextModels = currentModels.map((model) => {
        const preset = presetsById.get(model.id);
        const nextModel = preset
          ? {
              contextWindow: model.contextWindow ?? preset.contextWindow,
              id: model.id,
              maxTokens: model.maxTokens ?? preset.maxTokens,
            }
          : model;

        if (
          nextModel.contextWindow !== model.contextWindow ||
          nextModel.maxTokens !== model.maxTokens
        ) {
          hasChanged = true;
        }

        return nextModel;
      });

      return hasChanged ? nextModels : currentModels;
    });
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [presetModels]);

  const modelsById = useMemo(
    () =>
      new Map(
        [...modelOptions, ...selectedModels].map(
          (model) => [model.id, model] as const,
        ),
      ),
    [modelOptions, selectedModels],
  );

  const visibleModelOptions = useMemo(() => {
    const selectedModelIds = new Set(selectedModels.map((model) => model.id));

    return [
      ...selectedModels.map((model) => modelsById.get(model.id) ?? model),
      ...modelOptions.filter((option) => !selectedModelIds.has(option.id)),
    ];
  }, [modelOptions, modelsById, selectedModels]);

  function toggleModel(modelId: string) {
    setSelectedModels((currentModels) => {
      if (currentModels.some((model) => model.id === modelId)) {
        return currentModels.filter((model) => model.id !== modelId);
      }

      const model =
        modelsById.get(modelId) ??
        ({ id: modelId } satisfies ProviderModel);

      return [...currentModels, model];
    });
  }

  function removeModel(modelId: string) {
    setSelectedModels((currentModels) =>
      currentModels.filter((model) => model.id !== modelId),
    );
    setModelOptions((currentOptions) =>
      currentOptions.filter((model) => model.id !== modelId),
    );
  }

  function addModelIds(modelIds: readonly string[]) {
    setModelOptions((currentOptions) => {
      const optionsById = new Map(
        currentOptions.map((option) => [option.id, option] as const),
      );

      for (const model of selectedModels) {
        if (!optionsById.has(model.id)) {
          optionsById.set(model.id, model);
        }
      }

      for (const modelId of modelIds) {
        if (!optionsById.has(modelId)) {
          optionsById.set(modelId, { id: modelId });
        }
      }

      return [...optionsById.values()];
    });
  }

  function openAddModel() {
    setDraft({
      contextWindow: '',
      id: '',
      maxTokens: '',
      mode: 'add',
    });
  }

  function openModelEditor(modelId: string) {
    const model = modelsById.get(modelId);

    if (!model) {
      return;
    }

    setDraft({
      contextWindow: model.contextWindow ? String(model.contextWindow) : '',
      id: model.id,
      maxTokens: model.maxTokens ? String(model.maxTokens) : '',
      mode: 'edit',
      originalId: model.id,
    });
  }

  function closeModelEditor() {
    setDraft(null);
  }

  function saveModelDraft() {
    if (!draft) {
      return null;
    }

    const id = draft.id.trim();

    if (!id) {
      return '请输入模型 ID';
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
      return error instanceof Error ? error.message : '模型信息格式无效';
    }

    const originalId = draft.mode === 'edit' ? draft.originalId : undefined;
    const hasDuplicateId = [...selectedModels, ...modelOptions].some(
      (model) => model.id === id && model.id !== originalId,
    );

    if (hasDuplicateId) {
      return '模型 ID 已存在';
    }

    const nextModel: ProviderModel = {
      contextWindow,
      id,
      maxTokens,
    };

    if (draft.mode === 'add') {
      setModelOptions((currentOptions) => [...currentOptions, nextModel]);
      setSelectedModels((currentModels) => [...currentModels, nextModel]);
    } else {
      const replaceModel = (models: ProviderModel[]) =>
        models.map((model) => (model.id === originalId ? nextModel : model));

      setModelOptions(replaceModel);
      setSelectedModels(replaceModel);
    }

    setDraft(null);
    return null;
  }

  return {
    draft: {
      close: closeModelEditor,
      openAdd: openAddModel,
      openEdit: openModelEditor,
      save: saveModelDraft,
      set: setDraft,
      value: draft,
    },
    list: {
      addModelIds,
      removeModel,
      selectedModels,
      toggleModel,
      visibleModelOptions,
    },
  };
}
