import { SymbolView } from 'expo-symbols';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Pressable } from '@/components/gluestack/pressable';
import { TextField } from '@/components/ui/form';
import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const IDEA_PLACEHOLDER =
  '例如：一名回到故乡的修复师，在旧宅的墙里发现一封写给自己的信……';

type IdeaEditorCardState = {
  addedIdea: string;
  canGenerate: boolean;
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
  const isGenerateDisabled = state.isGenerating || !state.isReady;

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

      {state.showEditor ? (
        <TextField
          accessibilityLabel="故事想法"
          autoFocus
          frameStyle={[
            styles.ideaFrame,
            {
              backgroundColor: theme.background,
              borderColor: theme.accent,
            },
          ]}
          multiline
          onBlur={actions.onStopEditing}
          onChangeText={actions.onIdeaChange}
          placeholder={IDEA_PLACEHOLDER}
          scrollEnabled={false}
          style={styles.ideaInput}
          textAlignVertical="top"
          value={state.idea}
        />
      ) : (
        <Pressable
          accessibilityHint={
            state.isLocked ? undefined : '点击编辑故事想法'
          }
          accessibilityRole="button"
          accessibilityState={{ disabled: state.isLocked }}
          className="data-[disabled=true]:opacity-100"
          disabled={state.isLocked}
          onPress={actions.onStartEditing}
          style={({ pressed }) => [
            styles.ideaFrame,
            {
              backgroundColor: theme.background,
              borderColor: theme.backgroundSelected,
            },
            pressed && styles.pressed,
          ]}>
          {state.idea.length > 0 ? (
            <Text style={[styles.ideaInput, { color: theme.text }]}>
              {state.displayedIdea}
              {state.addedIdea ? (
                <Text style={{ color: theme.success }}>
                  {state.addedIdea}
                </Text>
              ) : null}
            </Text>
          ) : (
            <Text
              style={[
                styles.ideaInput,
                { color: theme.textSecondary },
              ]}>
              {IDEA_PLACEHOLDER}
            </Text>
          )}
        </Pressable>
      )}

      <View style={styles.inputMeta}>
        <ThemedText type="small" themeColor="textSecondary">
          {state.isAwaitingDecision
            ? '续写完成'
            : `${state.idea.length} 字`}
        </ThemedText>
        {state.isAwaitingDecision ? (
          <View style={styles.continuationActions}>
            <Pressable
              accessibilityLabel="抛弃续写内容"
              accessibilityRole="button"
              hitSlop={8}
              onPress={actions.onDiscardContinuation}
              style={({ pressed }) => pressed && styles.pressed}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                抛弃
              </ThemedText>
            </Pressable>
            <Pressable
              accessibilityLabel="保留续写内容"
              accessibilityRole="button"
              hitSlop={8}
              onPress={actions.onKeepContinuation}
              style={({ pressed }) => pressed && styles.pressed}>
              <ThemedText type="smallBold" themeColor="accent">
                保留
              </ThemedText>
            </Pressable>
          </View>
        ) : (
          <Pressable
            accessibilityLabel={
              state.hasIdea ? '自动续写故事想法' : '随机生成故事想法'
            }
            accessibilityRole="button"
            accessibilityState={{ disabled: isGenerateDisabled }}
            disabled={isGenerateDisabled}
            hitSlop={8}
            onPress={actions.onGenerate}
            style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText
              type="smallBold"
              themeColor={
                isGenerateDisabled ? 'textSecondary' : 'accent'
              }>
              {state.isGenerating
                ? '生成中…'
                : state.hasIdea
                  ? '自动续写'
                  : '随机生成'}
            </ThemedText>
          </Pressable>
        )}
      </View>
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
  ideaFrame: {
    minHeight: 196,
    marginTop: 14,
    borderWidth: 1,
    borderRadius: Radius.control,
    paddingHorizontal: 14,
    alignItems: 'stretch',
  },
  ideaInput: {
    minHeight: 194,
    paddingVertical: 14,
    fontSize: 16,
    lineHeight: 25,
    fontWeight: 400,
    includeFontPadding: false,
  },
  inputMeta: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  continuationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  pressed: {
    opacity: 0.62,
  },
});
