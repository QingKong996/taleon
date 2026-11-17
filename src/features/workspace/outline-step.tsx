import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/form';
import { SectionHeader } from '@/components/ui/section-header';
import { Surface } from '@/components/ui/surface';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { ChapterAccordion } from '@/features/workspace/chapter-accordion';
import { OUTLINE_CHAPTERS } from '@/features/workspace/workbench-data';
import { useTheme } from '@/hooks/use-theme';

type OutlineStepProps = {
  idea: string;
  onChangeSummary: (index: number, summary: string) => void;
  onEditIdea: () => void;
  onGenerateChapter: () => void;
  onSelectChapter: (index: number) => void;
  selectedChapter: number;
  summaries: readonly string[];
};

export function OutlineStep({
  idea,
  onChangeSummary,
  onEditIdea,
  onGenerateChapter,
  onSelectChapter,
  selectedChapter,
  summaries,
}: OutlineStepProps) {
  const theme = useTheme();
  const [expandedChapter, setExpandedChapter] = useState<number | null>(
    selectedChapter,
  );

  function toggleChapter(index: number) {
    const isExpanding = expandedChapter !== index;

    setExpandedChapter(isExpanding ? index : null);

    if (isExpanding) {
      onSelectChapter(index);
    }
  }

  return (
    <View style={styles.stepBody}>
      <View style={styles.intro}>
        <ThemedText type="subtitle" style={styles.introTitle}>
          故事大纲
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          展开章节编辑概要，选择一章生成正文。
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

      <SectionHeader
        detail={`${OUTLINE_CHAPTERS.length} 章`}
        title="章节概要"
      />

      <View style={styles.outlineList}>
        {OUTLINE_CHAPTERS.map((chapter, index) => (
          <ChapterAccordion
            chapter={chapter}
            expanded={expandedChapter === index}
            index={index}
            key={chapter.id}
            onToggle={() => toggleChapter(index)}
            selected={selectedChapter === index}
            summaryPreview={summaries[index]}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryLabelRow}>
                <SymbolView
                  name={{ ios: 'pencil', android: 'edit' }}
                  size={13}
                  tintColor={theme.textSecondary}
                />
                <ThemedText type="smallBold" themeColor="textSecondary">
                  概要内容
                </ThemedText>
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {summaries[index].length} / 400
              </ThemedText>
            </View>

            <TextField
              accessibilityLabel={`第 ${index + 1} 章概要`}
              frameStyle={[
                styles.summaryFrame,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.backgroundSelected,
                },
              ]}
              maxLength={400}
              multiline
              onChangeText={(summary) => onChangeSummary(index, summary)}
              placeholder="写下本章的情节概要……"
              scrollEnabled={false}
              style={styles.summaryInput}
              textAlignVertical="top"
              value={summaries[index]}
            />
          </ChapterAccordion>
        ))}
      </View>

      <Button
        align="between"
        label={`生成第 ${selectedChapter + 1} 章正文`}
        onPress={onGenerateChapter}
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
  outlineList: {
    gap: 8,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  summaryFrame: {
    minHeight: 96,
    borderWidth: 1,
    alignItems: 'stretch',
  },
  summaryInput: {
    minHeight: 94,
    paddingVertical: 10,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: 400,
  },
  pressed: {
    opacity: 0.62,
  },
});
