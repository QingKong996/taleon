import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/form';
import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useStoryIdeaGenerator } from '@/features/workspace/idea/use-story-idea-generator';
import { useTheme } from '@/hooks/use-theme';

const IDEA_PLACEHOLDER =
  '例如：一名回到故乡的修复师，在旧宅的墙里发现一封写给自己的信……';

type IdeaStepProps = {
  idea: string;
  onChangeIdea: (value: string) => void;
  onGenerate: () => void;
};

type PendingContinuation = {
  generatedIdea: string;
  originalIdea: string;
};

type IdeaPreview = {
  generatedIdea: string;
  originalIdea: string;
};

export function IdeaStep({
  idea,
  onChangeIdea,
  onGenerate,
}: IdeaStepProps) {
  const theme = useTheme();
  const { generateStoryIdea, isGenerating, isReady } = useStoryIdeaGenerator();
  const [isEditing, setIsEditing] = useState(false);
  const [pendingContinuation, setPendingContinuation] =
    useState<PendingContinuation | null>(null);
  const [streamingPreview, setStreamingPreview] =
    useState<IdeaPreview | null>(null);
  const hasIdea = idea.trim().length > 0;
  const isAwaitingDecision = pendingContinuation !== null;
  const isLocked = isGenerating || isAwaitingDecision;
  const showEditor = isEditing && !isLocked;
  const canGenerate = hasIdea && !isGenerating && !isAwaitingDecision;
  const preview =
    streamingPreview ??
    (pendingContinuation
      ? {
          generatedIdea: pendingContinuation.generatedIdea,
          originalIdea: pendingContinuation.originalIdea,
        }
      : null);
  const addedIdea = preview
    ? preview.generatedIdea.slice(preview.originalIdea.length)
    : '';
  const displayedIdea = preview ? preview.originalIdea : idea;

  async function handleGenerateIdea() {
    const originalIdea = idea;
    const shouldContinue = hasIdea;

    setIsEditing(false);
    Keyboard.dismiss();

    if (shouldContinue) {
      setStreamingPreview({ generatedIdea: originalIdea, originalIdea });
    }

    try {
      const nextIdea = await generateStoryIdea({
        idea,
        onIdeaChange(value) {
          onChangeIdea(value);

          if (shouldContinue) {
            setStreamingPreview({
              generatedIdea: value,
              originalIdea,
            });
          }
        },
      });

      if (nextIdea) {
        onChangeIdea(nextIdea);
        setStreamingPreview(null);

        if (shouldContinue) {
          setPendingContinuation({
            generatedIdea: nextIdea,
            originalIdea,
          });
        }
      }
    } catch (error) {
      setStreamingPreview(null);
      Alert.alert(
        '无法生成故事想法',
        error instanceof Error ? error.message : '请稍后重试',
      );
    }
  }

  function handleKeepContinuation() {
    if (!pendingContinuation) {
      return;
    }

    onChangeIdea(pendingContinuation.generatedIdea);
    setStreamingPreview(null);
    setPendingContinuation(null);
  }

  function handleDiscardContinuation() {
    if (!pendingContinuation) {
      return;
    }

    onChangeIdea(pendingContinuation.originalIdea);
    setStreamingPreview(null);
    setPendingContinuation(null);
  }

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

      <Surface radius={Radius.sheet} style={styles.card}>
        <View style={styles.cardHeader}>
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
          <View style={styles.cardHeaderCopy}>
            <ThemedText type="smallBold">故事灵感</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              从一个画面、一句话或一个人物开始
            </ThemedText>
          </View>
        </View>

        {showEditor ? (
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
            onBlur={() => setIsEditing(false)}
            onChangeText={onChangeIdea}
            placeholder={IDEA_PLACEHOLDER}
            scrollEnabled={false}
            style={styles.ideaInput}
            textAlignVertical="top"
            value={idea}
          />
        ) : (
          <Pressable
            accessibilityHint={isLocked ? undefined : '点击编辑故事想法'}
            accessibilityRole="button"
            accessibilityState={{ disabled: isLocked }}
            disabled={isLocked}
            onPress={() => setIsEditing(true)}
            style={({ pressed }) => [
              styles.ideaFrame,
              {
                backgroundColor: theme.background,
                borderColor: theme.backgroundSelected,
              },
              pressed && styles.pressed,
            ]}>
            {idea.length > 0 ? (
              <Text style={[styles.ideaInput, { color: theme.text }]}>
                {displayedIdea}
                {addedIdea ? (
                  <Text style={{ color: theme.success }}>{addedIdea}</Text>
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
            {isAwaitingDecision ? '续写完成' : `${idea.length} 字`}
          </ThemedText>
          {isAwaitingDecision ? (
            <View style={styles.continuationActions}>
              <Pressable
                accessibilityLabel="抛弃续写内容"
                accessibilityRole="button"
                hitSlop={8}
                onPress={handleDiscardContinuation}
                style={({ pressed }) => pressed && styles.pressed}>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  抛弃
                </ThemedText>
              </Pressable>
              <Pressable
                accessibilityLabel="保留续写内容"
                accessibilityRole="button"
                hitSlop={8}
                onPress={handleKeepContinuation}
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
              accessibilityState={{ disabled: isGenerating || !isReady }}
              disabled={isGenerating || !isReady}
              hitSlop={8}
              onPress={() => {
                void handleGenerateIdea();
              }}
              style={({ pressed }) => pressed && styles.pressed}>
              <ThemedText
                type="smallBold"
                themeColor={isGenerating || !isReady ? 'textSecondary' : 'accent'}>
                {isGenerating ? '生成中…' : hasIdea ? '自动续写' : '随机生成'}
              </ThemedText>
            </Pressable>
          )}
        </View>
      </Surface>

      <Button
        align="between"
        disabled={!canGenerate}
        label="生成故事大纲"
        onPress={onGenerate}
        trailingIcon={
          <SymbolView
            name={{ ios: 'arrow.right', android: 'arrow_forward' }}
            size={16}
            tintColor={
              canGenerate ? theme.background : theme.textSecondary
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
  card: {
    padding: 16,
  },
  cardHeader: {
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
  cardHeaderCopy: {
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
