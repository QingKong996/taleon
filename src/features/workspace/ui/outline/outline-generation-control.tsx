import { SymbolView } from 'expo-symbols';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type OutlineGenerationControlProps = {
  canGenerate: boolean;
  generationLabel: string;
  hasChapters: boolean;
  isGenerating: boolean;
  isGeneratingOutline: boolean;
  onGenerate: () => void;
  rangeLabel: string;
};

export function OutlineGenerationControl({
  canGenerate,
  generationLabel,
  hasChapters,
  isGenerating,
  isGeneratingOutline,
  onGenerate,
  rangeLabel,
}: OutlineGenerationControlProps) {
  const theme = useTheme();

  return (
    <>
      <Button
        align="between"
        disabled={!canGenerate}
        label={
          isGeneratingOutline
            ? '正在生成大纲…'
            : `${hasChapters ? '重新生成' : '生成'}${rangeLabel}大纲`
        }
        loading={isGeneratingOutline}
        onPress={onGenerate}
        size="compact"
        trailingIcon={
          <SymbolView
            name={{ ios: 'sparkles', android: 'auto_awesome' }}
            size={15}
            tintColor={
              canGenerate ? theme.background : theme.textSecondary
            }
          />
        }
      />

      {isGenerating ? (
        <View style={styles.generatingStatus}>
          <ActivityIndicator color={theme.accent} size="small" />
          <ThemedText type="small" themeColor="textSecondary">
            {generationLabel}
          </ThemedText>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  generatingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 4,
  },
});
