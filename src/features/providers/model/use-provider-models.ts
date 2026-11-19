import { useEffect, useMemo, useState } from 'react';

import {
  createModelFromDraft,
  type ProviderModelDraft,
} from '@/features/providers/model/provider-model-draft';
import type { ProviderModel } from '@/lib/provider/config';

type UseProviderModelsOptions = {
  initialModels?: readonly ProviderModel[];
  presetModels: readonly ProviderModel[];
};

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

    const result = createModelFromDraft(draft, [
      ...selectedModels,
      ...modelOptions,
    ]);

    if ('error' in result) {
      return result.error;
    }

    const nextModel = result.model;
    const originalId = draft.mode === 'edit' ? draft.originalId : undefined;

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
