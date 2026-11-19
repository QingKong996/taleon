import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { SelectableChipGroup } from '@/components/selectable-chip-group';
import { Button } from '@/components/ui/button';
import { FormSection } from '@/components/ui/form';
import { Spacing } from '@/constants/theme';
import type { ProviderModel } from '@/lib/provider/config';
import { useTheme } from '@/hooks/use-theme';

type ProviderModelsSectionProps = {
  canFetchModels: boolean;
  fetchingModels: boolean;
  onAddModel: () => void;
  onFetchModels: () => void;
  onLongPressModel: (modelId: string) => void;
  onRemoveModel: (modelId: string) => void;
  onToggleModel: (modelId: string) => void;
  selectedModels: readonly ProviderModel[];
  visibleModelOptions: readonly ProviderModel[];
};

export function ProviderModelsSection({
  canFetchModels,
  fetchingModels,
  onAddModel,
  onFetchModels,
  onLongPressModel,
  onRemoveModel,
  onToggleModel,
  selectedModels,
  visibleModelOptions,
}: ProviderModelsSectionProps) {
  const theme = useTheme();

  return (
    <FormSection title="模型">
      <View style={styles.actions}>
        <Button
          label="添加模型"
          leadingIcon={
            <SymbolView
              name={{ ios: 'plus', android: 'add' }}
              size={13}
              tintColor={theme.accent}
            />
          }
          onPress={onAddModel}
          size="compact"
          variant="soft"
        />

        {canFetchModels ? (
          <Button
            label="获取模型"
            leadingIcon={
              fetchingModels ? undefined : (
                <SymbolView
                  name={{
                    ios: 'arrow.clockwise',
                    android: 'refresh',
                  }}
                  size={13}
                  tintColor={theme.accent}
                />
              )
            }
            loading={fetchingModels}
            onPress={onFetchModels}
            size="compact"
            variant="soft"
          />
        ) : null}
      </View>

      {visibleModelOptions.length > 0 ? (
        <SelectableChipGroup
          onLongPress={onLongPressModel}
          onRemove={onRemoveModel}
          onToggle={onToggleModel}
          options={visibleModelOptions.map((model) => ({
            label: model.id,
            value: model.id,
          }))}
          removable
          selectedValues={selectedModels.map((model) => model.id)}
        />
      ) : null}
    </FormSection>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
});
