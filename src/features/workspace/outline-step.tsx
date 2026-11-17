import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/form';
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

type PlanNumberFieldProps = {
  label: string;
  max: number;
  maxLength: number;
  min: number;
  onChange: (value: number) => void;
  suffix: string;
  value: number;
};

function clamp(value: number, lower: number, upper: number) {
  return Math.min(Math.max(value, lower), upper);
}

function formatChapterRange([start, end]: [number, number]) {
  return start === end ? `第 ${start} 章` : `第 ${start}–${end} 章`;
}

function PlanNumberField({
  label,
  max,
  maxLength,
  min,
  onChange,
  suffix,
  value,
}: PlanNumberFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);

  function commit() {
    const parsed = Number(draft ?? value);
    const nextValue = clamp(
      Number.isFinite(parsed) ? Math.round(parsed) : value,
      min,
      max,
    );

    setDraft(null);

    if (nextValue !== value) {
      onChange(nextValue);
    }
  }

  function updateDraft(text: string) {
    const digits = text.replace(/\D/g, '').slice(0, maxLength);

    setDraft(digits);

    if (!digits) {
      return;
    }

    const parsed = Number(digits);

    if (parsed >= min && parsed <= max) {
      onChange(parsed);
    }
  }

  return (
    <View style={styles.planField}>
      <TextField
        accessibilityLabel={label}
        keyboardType="number-pad"
        label={label}
        maxLength={maxLength}
        onBlur={commit}
        onChangeText={updateDraft}
        onFocus={() => setDraft(String(value))}
        onSubmitEditing={commit}
        returnKeyType="done"
        selectTextOnFocus
        style={styles.planInput}
        trailing={
          <ThemedText type="small" themeColor="textSecondary">
            {suffix}
          </ThemedText>
        }
        value={draft ?? String(value)}
      />
    </View>
  );
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
          <PlanNumberField
            label="预计章数"
            max={MAX_CHAPTER_COUNT}
            maxLength={3}
            min={MIN_CHAPTER_COUNT}
            onChange={onChangeChapterCount}
            suffix="章"
            value={chapterCount}
          />
          <PlanNumberField
            label="每章字数"
            max={MAX_WORDS_PER_CHAPTER}
            maxLength={5}
            min={MIN_WORDS_PER_CHAPTER}
            onChange={onChangeWordsPerChapter}
            suffix="字"
            value={wordsPerChapter}
          />
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
            <PlanNumberField
              label="起始章"
              max={chapterRange[1]}
              maxLength={3}
              min={MIN_CHAPTER_COUNT}
              onChange={(value) =>
                onChangeChapterRange([value, chapterRange[1]])
              }
              suffix="章"
              value={chapterRange[0]}
            />
            <PlanNumberField
              label="结束章"
              max={chapterCount}
              maxLength={3}
              min={chapterRange[0]}
              onChange={(value) =>
                onChangeChapterRange([chapterRange[0], value])
              }
              suffix="章"
              value={chapterRange[1]}
            />
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
