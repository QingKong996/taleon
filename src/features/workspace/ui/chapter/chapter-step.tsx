import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { ChapterAccordion } from '@/features/workspace/ui/chapter/chapter-accordion';
import {
  OUTLINE_CHAPTERS,
  type ChapterSection,
} from '@/features/workspace/model/workbench-data';
import { useTheme } from '@/hooks/use-theme';

type ChapterStepProps = {
  chapterIndex: number;
  onBackToOutline: () => void;
  onSelectChapter: (index: number) => void;
};

export function ChapterStep({
  chapterIndex,
  onBackToOutline,
  onSelectChapter,
}: ChapterStepProps) {
  const theme = useTheme();
  const chapter = OUTLINE_CHAPTERS[chapterIndex];
  const [expandedChapter, setExpandedChapter] = useState<number | null>(
    chapterIndex,
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
      <View style={styles.contentHeader}>
        <View style={styles.contentHeaderCopy}>
          <ThemedText type="subtitle" style={styles.introTitle}>
            章节内容
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            第 {chapterIndex + 1} 章 · {chapter.title}
          </ThemedText>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: theme.accentSoft },
          ]}>
          <View
            style={[styles.statusDot, { backgroundColor: theme.accent }]}
          />
          <ThemedText
            type="smallBold"
            themeColor="accent"
            style={styles.statusText}>
            已生成
          </ThemedText>
        </View>
      </View>

      <View style={styles.outlineList}>
        {OUTLINE_CHAPTERS.map((item, index) => (
          <ChapterAccordion
            chapter={item}
            contentStyle={styles.readingBody}
            expanded={expandedChapter === index}
            index={index}
            key={item.id}
            onToggle={() => toggleChapter(index)}
            selected={chapterIndex === index}>
            {item.paragraphs.length > 0 ? (
              <ParagraphList id={item.id} paragraphs={item.paragraphs} />
            ) : null}

            {item.sections?.map((section, sectionIndex) => (
              <ChapterSectionView
                index={sectionIndex}
                key={section.id}
                section={section}
              />
            ))}
          </ChapterAccordion>
        ))}
      </View>

      <Button
        label="返回大纲"
        leadingIcon={
          <SymbolView
            name={{ ios: 'arrow.left', android: 'arrow_back' }}
            size={15}
            tintColor={theme.text}
          />
        }
        onPress={onBackToOutline}
        variant="secondary"
      />
    </View>
  );
}

type ParagraphListProps = {
  id: string;
  paragraphs: readonly string[];
};

function ParagraphList({ id, paragraphs }: ParagraphListProps) {
  return (
    <View style={styles.paragraphList}>
      {paragraphs.map((paragraph, paragraphIndex) => (
        <ThemedText
          key={`${id}-${paragraphIndex}`}
          style={styles.paragraph}>
          {paragraph}
        </ThemedText>
      ))}
    </View>
  );
}

type ChapterSectionViewProps = {
  index: number;
  section: ChapterSection;
};

function ChapterSectionView({ index, section }: ChapterSectionViewProps) {
  return (
    <View style={styles.chapterSection}>
      <View style={styles.chapterSectionHeader}>
        <ThemedText type="smallBold" themeColor="accent">
          第 {index + 1} 节
        </ThemedText>
        <ThemedText type="smallBold" style={styles.chapterSectionTitle}>
          {section.title}
        </ThemedText>
      </View>
      <ParagraphList id={section.id} paragraphs={section.paragraphs} />
    </View>
  );
}

const styles = StyleSheet.create({
  stepBody: {
    gap: 18,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  contentHeaderCopy: {
    flex: 1,
    gap: 6,
  },
  introTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  statusBadge: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    lineHeight: 16,
  },
  outlineList: {
    gap: 8,
  },
  readingBody: {
    gap: 18,
    padding: 16,
  },
  chapterSection: {
    gap: 10,
  },
  chapterSectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  chapterSectionTitle: {
    flexShrink: 1,
  },
  paragraphList: {
    gap: 16,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 28,
    fontWeight: 400,
  },
});
