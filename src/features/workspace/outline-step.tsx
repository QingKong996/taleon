import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ScrubbableNumberField } from '@/components/ui/scrubbable-number-field';
import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import {
  MAX_CHAPTER_COUNT,
  MAX_WORDS_PER_CHAPTER,
  MIN_CHAPTER_COUNT,
  MIN_WORDS_PER_CHAPTER,
} from '@/features/workspace/workbench-data';
import { useTheme } from '@/hooks/use-theme';

type OutlineStepProps = {
  chapterCount: number;
  chapterRange: [number, number];
  idea: string;
  onChangeChapterCount: (value: number) => void;
  onChangeChapterRange: (range: [number, number]) => void;
  onChangeWordsPerChapter: (value: number) => void;
  onEditIdea: () => void;
  onGenerateChapters: () => void;
  wordsPerChapter: number;
};

function formatChapterRange([start, end]: [number, number]) {
  return start === end ? `第 ${start} 章` : `第 ${start}–${end} 章`;
}

export function OutlineStep({
  chapterCount,
  chapterRange,
  idea,
  onChangeChapterCount,
  onChangeChapterRange,
  onChangeWordsPerChapter,
  onEditIdea,
  onGenerateChapters,
  wordsPerChapter,
}: OutlineStepProps) {
  const theme = useTheme();
  const rangeLabel = formatChapterRange(chapterRange);
  const selectedChapterCount = chapterRange[1] - chapterRange[0] + 1;

  return (
    <View style={styles.stepBody}>
      <View style={styles.intro}>
        <ThemedText type="subtitle" style={styles.introTitle}>
          故事大纲
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          设置篇幅与章节范围，按所选范围生成或重写正文。
        </ThemedText>
      </View>

      <Surface radius={Radius.panel} style={styles.ideaPreview}>
        <View style={styles.ideaPreviewHeader}>
          <View
            style={[styles.statusDot, { backgroundColor: theme.accent }]}
          />
          <ThemedText type="smallBold" style={styles.ideaPreviewLabel}>
            你的故事
          </ThemedText>
          <Pressable
            accessibilityLabel="修改故事想法"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onEditIdea}
            style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText type="smallBold" themeColor="accent">
              修改
            </ThemedText>
          </Pressable>
        </View>
        <ThemedText numberOfLines={3} style={styles.ideaPreviewText}>
          {idea}
        </ThemedText>
      </Surface>

      <Surface radius={Radius.panel} style={styles.planCard}>
        <View style={styles.planFields}>
          <View style={styles.planField}>
            <ScrubbableNumberField
              label="预计章数"
              max={MAX_CHAPTER_COUNT}
              maxLength={3}
              min={MIN_CHAPTER_COUNT}
              onChange={onChangeChapterCount}
              suffix="章"
              textStyle={styles.planInput}
              value={chapterCount}
            />
          </View>
          <View style={styles.planField}>
            <ScrubbableNumberField
              label="每章字数"
              max={MAX_WORDS_PER_CHAPTER}
              maxLength={5}
              min={MIN_WORDS_PER_CHAPTER}
              onChange={onChangeWordsPerChapter}
              step={100}
              suffix="字"
              textStyle={styles.planInput}
              value={wordsPerChapter}
            />
          </View>
        </View>

        <View
          style={[
            styles.divider,
            { backgroundColor: theme.backgroundSelected },
          ]}
        />

        <View style={styles.rangeSection}>
          <View style={styles.rangeHeader}>
            <View style={styles.rangeHeading}>
              <ThemedText type="smallBold">生成范围</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {selectedChapterCount} 章
              </ThemedText>
            </View>
            <ThemedText type="smallBold" themeColor="accent">
              {rangeLabel}
            </ThemedText>
          </View>

          <View style={styles.rangeFields}>
            <View style={styles.planField}>
              <ScrubbableNumberField
                label="起始章"
                max={chapterRange[1]}
                maxLength={3}
                min={MIN_CHAPTER_COUNT}
                onChange={(value) =>
                  onChangeChapterRange([value, chapterRange[1]])
                }
                suffix="章"
                textStyle={styles.planInput}
                value={chapterRange[0]}
              />
            </View>
            <View style={styles.planField}>
              <ScrubbableNumberField
                label="结束章"
                max={chapterCount}
                maxLength={3}
                min={chapterRange[0]}
                onChange={(value) =>
                  onChangeChapterRange([chapterRange[0], value])
                }
                suffix="章"
                textStyle={styles.planInput}
                value={chapterRange[1]}
              />
            </View>
          </View>
        </View>
      </Surface>

      <Button
        align="between"
        label={`生成${rangeLabel}正文`}
        onPress={onGenerateChapters}
        trailingIcon={
          <SymbolView
            name={{ ios: 'arrow.right', android: 'arrow_forward' }}
            size={16}
            tintColor={theme.background}
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
  ideaPreview: {
    gap: 8,
    padding: 14,
  },
  ideaPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ideaPreviewLabel: {
    flex: 1,
  },
  ideaPreviewText: {
    fontSize: 15,
    lineHeight: 23,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  planCard: {
    gap: 16,
    padding: 14,
  },
  planFields: {
    flexDirection: 'row',
    gap: 10,
  },
  planField: {
    flex: 1,
  },
  planInput: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: 500,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  rangeSection: {
    gap: 10,
  },
  rangeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rangeHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  rangeFields: {
    flexDirection: 'row',
    gap: 10,
  },
  pressed: {
    opacity: 0.62,
  },
});
