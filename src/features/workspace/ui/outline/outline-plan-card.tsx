import { StyleSheet, View } from 'react-native';

import { ScrubbableNumberField } from '@/components/ui/scrubbable-number-field';
import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import {
  MAX_CHAPTER_COUNT,
  MAX_WORDS_PER_CHAPTER,
  MIN_CHAPTER_COUNT,
  MIN_WORDS_PER_CHAPTER,
} from '@/features/workspace/model/workbench-data';
import { formatChapterRange } from '@/features/workspace/ui/outline/outline-format';
import { useTheme } from '@/hooks/use-theme';

type OutlinePlanCardProps = {
  chapterCount: number;
  chapterRange: [number, number];
  disabled: boolean;
  onChangeChapterCount: (value: number) => void;
  onChangeChapterRange: (range: [number, number]) => void;
  onChangeWordsPerChapter: (value: number) => void;
  wordsPerChapter: number;
};

export function OutlinePlanCard({
  chapterCount,
  chapterRange,
  disabled,
  onChangeChapterCount,
  onChangeChapterRange,
  onChangeWordsPerChapter,
  wordsPerChapter,
}: OutlinePlanCardProps) {
  const theme = useTheme();
  const selectedChapterCount =
    chapterRange[1] - chapterRange[0] + 1;

  return (
    <Surface radius={Radius.control} style={styles.card}>
      <View style={styles.fields}>
        <View style={styles.field}>
          <ScrubbableNumberField
            compact
            disabled={disabled}
            label="预计章数"
            max={MAX_CHAPTER_COUNT}
            maxLength={3}
            min={MIN_CHAPTER_COUNT}
            onChange={onChangeChapterCount}
            suffix="章"
            textStyle={styles.input}
            value={chapterCount}
          />
        </View>
        <View style={styles.field}>
          <ScrubbableNumberField
            compact
            disabled={disabled}
            label="每章字数"
            max={MAX_WORDS_PER_CHAPTER}
            maxLength={5}
            min={MIN_WORDS_PER_CHAPTER}
            onChange={onChangeWordsPerChapter}
            step={100}
            suffix="字"
            textStyle={styles.input}
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
            <ThemedText type="smallBold" style={styles.rangeTitle}>
              生成范围
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {selectedChapterCount} 章
            </ThemedText>
          </View>
          <ThemedText type="smallBold" themeColor="accent">
            {formatChapterRange(chapterRange)}
          </ThemedText>
        </View>

        <View style={styles.fields}>
          <View style={styles.field}>
            <ScrubbableNumberField
              compact
              disabled={disabled}
              label="起始章"
              max={chapterRange[1]}
              maxLength={3}
              min={MIN_CHAPTER_COUNT}
              onChange={(value) =>
                onChangeChapterRange([value, chapterRange[1]])
              }
              suffix="章"
              textStyle={styles.input}
              value={chapterRange[0]}
            />
          </View>
          <View style={styles.field}>
            <ScrubbableNumberField
              compact
              disabled={disabled}
              label="结束章"
              max={chapterCount}
              maxLength={3}
              min={chapterRange[0]}
              onChange={(value) =>
                onChangeChapterRange([chapterRange[0], value])
              }
              suffix="章"
              textStyle={styles.input}
              value={chapterRange[1]}
            />
          </View>
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 9,
    padding: 9,
  },
  fields: {
    flexDirection: 'row',
    gap: 8,
  },
  field: {
    flex: 1,
  },
  input: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: 500,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  rangeSection: {
    gap: 6,
  },
  rangeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  rangeHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rangeTitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});
