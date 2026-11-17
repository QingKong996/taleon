import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/form';
import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { SAMPLE_IDEA } from '@/features/workspace/workbench-data';
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
  const [isFocused, setIsFocused] = useState(false);
  const canGenerate = idea.trim().length > 0;

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

        <TextField
          accessibilityLabel="故事想法"
          frameStyle={[
            styles.ideaFrame,
            {
              backgroundColor: theme.background,
              borderColor: isFocused
                ? theme.accent
                : theme.backgroundSelected,
            },
          ]}
          maxLength={800}
          multiline
          onBlur={() => setIsFocused(false)}
          onChangeText={onChangeIdea}
          onFocus={() => setIsFocused(true)}
          placeholder="例如：一名回到故乡的修复师，在旧宅的墙里发现一封写给自己的信……"
          scrollEnabled={false}
          style={styles.ideaInput}
          textAlignVertical="top"
          value={idea}
        />

        <View style={styles.inputMeta}>
          <ThemedText type="small" themeColor="textSecondary">
            {idea.length} / 800
          </ThemedText>
          <Pressable
            accessibilityLabel="填入示例故事想法"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => onChangeIdea(SAMPLE_IDEA)}
            style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText type="smallBold" themeColor="accent">
              填入示例
            </ThemedText>
          </Pressable>
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
  },
  inputMeta: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.62,
  },
});
