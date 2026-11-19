import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { IdeaEditorField } from '@/features/workspace/ui/idea/idea-editor-field';
import { IdeaEditorMeta } from '@/features/workspace/ui/idea/idea-editor-meta';
import { useTheme } from '@/hooks/use-theme';

type IdeaEditorCardState = {
  addedIdea: string;
  displayedIdea: string;
  hasIdea: boolean;
  idea: string;
  isAwaitingDecision: boolean;
  isGenerating: boolean;
  isLocked: boolean;
  isReady: boolean;
  showEditor: boolean;
};

type IdeaEditorCardActions = {
  onDiscardContinuation: () => void;
  onGenerate: () => void;
  onIdeaChange: (value: string) => void;
  onKeepContinuation: () => void;
  onStartEditing: () => void;
  onStopEditing: () => void;
};

type IdeaEditorCardProps = {
  actions: IdeaEditorCardActions;
  state: IdeaEditorCardState;
};

export function IdeaEditorCard({
  actions,
  state,
}: IdeaEditorCardProps) {
  const theme = useTheme();

  return (
    <Surface radius={Radius.sheet} style={styles.card}>
      <View style={styles.header}>
        <View
          style={[
            styles.iconTile,
            { backgroundColor: theme.accentSoft },
          ]}>
          <SymbolView
            name={{ ios: 'lightbulb.fill', android: 'lightbulb' }}
            size={17}
            tintColor={theme.accent}
          />
        </View>
        <View style={styles.headerCopy}>
          <ThemedText type="smallBold">故事灵感</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            从一个画面、一句话或一个人物开始
          </ThemedText>
        </View>
      </View>

      <IdeaEditorField
        addedIdea={state.addedIdea}
        displayedIdea={state.displayedIdea}
        idea={state.idea}
        isLocked={state.isLocked}
        onChange={actions.onIdeaChange}
        onStartEditing={actions.onStartEditing}
        onStopEditing={actions.onStopEditing}
        showEditor={state.showEditor}
      />

      <IdeaEditorMeta
        characterCount={state.idea.length}
        hasIdea={state.hasIdea}
        isAwaitingDecision={state.isAwaitingDecision}
        isGenerating={state.isGenerating}
        isReady={state.isReady}
        onDiscardContinuation={actions.onDiscardContinuation}
        onGenerate={actions.onGenerate}
        onKeepContinuation={actions.onKeepContinuation}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: Radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
});
