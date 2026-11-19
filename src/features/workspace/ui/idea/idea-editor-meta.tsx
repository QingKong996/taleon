import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

type IdeaEditorMetaProps = {
  characterCount: number;
  hasIdea: boolean;
  isAwaitingDecision: boolean;
  isGenerating: boolean;
  isReady: boolean;
  onDiscardContinuation: () => void;
  onGenerate: () => void;
  onKeepContinuation: () => void;
};

export function IdeaEditorMeta({
  characterCount,
  hasIdea,
  isAwaitingDecision,
  isGenerating,
  isReady,
  onDiscardContinuation,
  onGenerate,
  onKeepContinuation,
}: IdeaEditorMetaProps) {
  const isGenerateDisabled = isGenerating || !isReady;

  return (
    <View style={styles.inputMeta}>
      <ThemedText type="small" themeColor="textSecondary">
        {isAwaitingDecision ? '续写完成' : `${characterCount} 字`}
      </ThemedText>
      {isAwaitingDecision ? (
        <View style={styles.continuationActions}>
          <Pressable
            accessibilityLabel="抛弃续写内容"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onDiscardContinuation}
            style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              抛弃
            </ThemedText>
          </Pressable>
          <Pressable
            accessibilityLabel="保留续写内容"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onKeepContinuation}
            style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText type="smallBold" themeColor="accent">
              保留
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <Pressable
          accessibilityLabel={
            hasIdea ? '自动续写故事想法' : '随机生成故事想法'
          }
          accessibilityRole="button"
          accessibilityState={{ disabled: isGenerateDisabled }}
          disabled={isGenerateDisabled}
          hitSlop={8}
          onPress={onGenerate}
          style={({ pressed }) => pressed && styles.pressed}>
          <ThemedText
            type="smallBold"
            themeColor={
              isGenerateDisabled ? 'textSecondary' : 'accent'
            }>
            {isGenerating
              ? '生成中…'
              : hasIdea
                ? '自动续写'
                : '随机生成'}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
