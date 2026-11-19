import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { IdeaEditorCard } from '@/features/workspace/ui/idea/idea-editor-card';
import { useIdeaStep } from '@/features/workspace/ui/idea/use-idea-step';
import { useTheme } from '@/hooks/use-theme';

type IdeaStepProps = {
  idea: string;
  onChangeIdea: (value: string) => void;
  onGenerate: () => void;
};

export function IdeaStep({
  idea,
  onChangeIdea,
  onGenerate,
}: IdeaStepProps) {
  const theme = useTheme();
  const { actions, state } = useIdeaStep({ idea, onChangeIdea });

  return (
    <View style={styles.stepBody}>
      <View style={styles.intro}>
        <ThemedText type="subtitle" style={styles.introTitle}>
          故事想法
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          描述人物、冲突和你想要营造的氛围。
        </ThemedText>
      </View>

      <IdeaEditorCard
        actions={actions}
        state={state}
      />

      <Button
        align="between"
        disabled={!state.canGenerate}
        label="生成故事大纲"
        onPress={onGenerate}
        trailingIcon={
          <SymbolView
            name={{ ios: 'arrow.right', android: 'arrow_forward' }}
            size={16}
            tintColor={
              state.canGenerate
                ? theme.background
                : theme.textSecondary
            }
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stepBody: {
    gap: 18,
  },
  intro: {
    gap: 6,
  },
  introTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
});
